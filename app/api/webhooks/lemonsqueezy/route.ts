import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { getPlanFromVariantId } from '@/lib/lemonsqueezy'

// Use Node.js runtime for crypto module
export const runtime = 'nodejs'

let _adminSupabase: SupabaseClient | null = null

function getAdminSupabase(): SupabaseClient {
  if (!_adminSupabase) {
    _adminSupabase = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim(),
      (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
    )
  }
  return _adminSupabase
}

// ────────────────────────────────────────────────────────────
// Webhook signature verification
// Lemon Squeezy signs the raw body with HMAC SHA-256
// The signature is in the X-Signature request header
// ────────────────────────────────────────────────────────────
function verifySignature(rawBody: string, signature: string): boolean {
  try {
    const secret = (process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '').trim()
    if (!secret) {
      console.error('LEMONSQUEEZY_WEBHOOK_SECRET is not set')
      return false
    }
    const hmac = crypto.createHmac('sha256', secret)
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'hex')
    const sig = Buffer.from(signature, 'hex')
    if (digest.length !== sig.length) return false
    return crypto.timingSafeEqual(digest, sig)
  } catch {
    return false
  }
}

// ────────────────────────────────────────────────────────────
// Helper: find user_id for a subscription
// Tries subscriptions table first; falls back to custom_data
// ────────────────────────────────────────────────────────────
async function findUserBySubscriptionId(
  lsSubscriptionId: string
): Promise<string | null> {
  const { data } = await getAdminSupabase()
    .from('subscriptions')
    .select('user_id')
    .eq('lemonsqueezy_subscription_id', lsSubscriptionId)
    .single()
  return data?.user_id ?? null
}

async function findUserByCustomerId(
  lsCustomerId: string
): Promise<string | null> {
  const { data } = await getAdminSupabase()
    .from('subscriptions')
    .select('user_id')
    .eq('lemonsqueezy_customer_id', lsCustomerId)
    .single()
  return data?.user_id ?? null
}

// ────────────────────────────────────────────────────────────
// Lemon Squeezy webhook payload types
// ────────────────────────────────────────────────────────────
interface LSWebhookMeta {
  event_name: string
  webhook_id?: string
  test_mode?: boolean
  custom_data?: {
    user_id?: string
    plan?: string
  }
}

interface LSSubscriptionAttributes {
  store_id: number
  customer_id: number
  order_id: number
  variant_id: number
  product_id: number
  status: string
  cancelled: boolean
  renews_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

interface LSSubscriptionData {
  type: 'subscriptions'
  id: string
  attributes: LSSubscriptionAttributes
}

interface LSWebhookPayload {
  meta: LSWebhookMeta
  data: LSSubscriptionData
}

// ────────────────────────────────────────────────────────────
// Main webhook handler
// ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing X-Signature header' }, { status: 400 })
  }

  if (!verifySignature(rawBody, signature)) {
    console.error('Lemon Squeezy webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: LSWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { meta, data } = payload
  const eventName = meta.event_name
  const customData = meta.custom_data

  console.log(`Lemon Squeezy webhook received: ${eventName}`, { subscriptionId: data?.id })

  try {
    switch (eventName) {
      // ──────────────────────────────────────────────────────
      // New subscription created — upgrade user plan
      // ──────────────────────────────────────────────────────
      case 'subscription_created': {
        const attrs = data.attributes
        const lsSubscriptionId = data.id
        const lsCustomerId = String(attrs.customer_id)
        const variantId = String(attrs.variant_id)

        // Determine which plan this variant maps to
        const plan = getPlanFromVariantId(variantId)
        if (!plan) {
          console.error(`Unknown variant_id in subscription_created: ${variantId}`)
          break
        }

        // Find the user — primary: custom_data.user_id, fallback: customer_id lookup
        let userId = customData?.user_id ?? null
        if (!userId) {
          userId = await findUserByCustomerId(lsCustomerId)
        }
        if (!userId) {
          console.error(`No user found for subscription_created (variant: ${variantId}, customer: ${lsCustomerId})`)
          break
        }

        const now = new Date()
        const periodEnd = attrs.renews_at
          ? new Date(attrs.renews_at)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        const { error: updateError } = await getAdminSupabase()
          .from('subscriptions')
          .update({
            plan,
            status: 'active',
            lemonsqueezy_subscription_id: lsSubscriptionId,
            lemonsqueezy_customer_id: lsCustomerId,
            lemonsqueezy_variant_id: variantId,
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            generations_used: 0,
            updated_at: now.toISOString(),
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('DB update error on subscription_created:', updateError)
        } else {
          console.log(`User ${userId} upgraded to ${plan}`)
        }

        // Record payment
        await getAdminSupabase().from('payments').insert({
          user_id: userId,
          lemonsqueezy_order_id: String(attrs.order_id),
          status: 'succeeded',
          plan,
          currency: 'usd',
        })

        break
      }

      // ──────────────────────────────────────────────────────
      // Subscription renewed / payment success — keep active
      // ──────────────────────────────────────────────────────
      case 'subscription_payment_success':
      case 'subscription_updated': {
        const attrs = data.attributes
        const lsSubscriptionId = data.id

        const userId =
          customData?.user_id ??
          (await findUserBySubscriptionId(lsSubscriptionId))

        if (!userId) {
          console.error(`No user found for ${eventName} (subscription: ${lsSubscriptionId})`)
          break
        }

        const now = new Date()
        const periodEnd = attrs.renews_at
          ? new Date(attrs.renews_at)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Map LS status to our status
        let status: string
        if (attrs.status === 'active') {
          status = 'active'
        } else if (attrs.status === 'paused') {
          status = 'paused'
        } else if (attrs.status === 'cancelled') {
          status = 'cancelled'
        } else if (attrs.status === 'expired') {
          status = 'expired'
        } else {
          status = attrs.status
        }

        await getAdminSupabase()
          .from('subscriptions')
          .update({
            status,
            current_period_end: periodEnd.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('user_id', userId)

        console.log(`User ${userId} subscription status updated to ${status}`)
        break
      }

      // ──────────────────────────────────────────────────────
      // Subscription cancelled — mark cancelled, keep plan active
      // until ends_at (user keeps access until period ends)
      // ──────────────────────────────────────────────────────
      case 'subscription_cancelled': {
        const attrs = data.attributes
        const lsSubscriptionId = data.id

        const userId =
          customData?.user_id ??
          (await findUserBySubscriptionId(lsSubscriptionId))

        if (!userId) {
          console.error(`No user found for subscription_cancelled (subscription: ${lsSubscriptionId})`)
          break
        }

        const endsAt = attrs.ends_at
          ? new Date(attrs.ends_at).toISOString()
          : new Date().toISOString()

        await getAdminSupabase()
          .from('subscriptions')
          .update({
            status: 'cancelled',
            current_period_end: endsAt,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`User ${userId} subscription cancelled, access until ${endsAt}`)
        break
      }

      // ──────────────────────────────────────────────────────
      // Subscription expired — downgrade to free plan
      // ──────────────────────────────────────────────────────
      case 'subscription_expired': {
        const lsSubscriptionId = data.id

        const userId =
          customData?.user_id ??
          (await findUserBySubscriptionId(lsSubscriptionId))

        if (!userId) {
          console.error(`No user found for subscription_expired (subscription: ${lsSubscriptionId})`)
          break
        }

        const now = new Date()
        await getAdminSupabase()
          .from('subscriptions')
          .update({
            plan: 'free',
            status: 'expired',
            lemonsqueezy_subscription_id: null,
            lemonsqueezy_variant_id: null,
            generations_used: 0,
            current_period_start: now.toISOString(),
            current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('user_id', userId)

        console.log(`User ${userId} downgraded to free (subscription expired)`)
        break
      }

      // ──────────────────────────────────────────────────────
      // Payment failed — mark as expired, do NOT upgrade
      // ──────────────────────────────────────────────────────
      case 'subscription_payment_failed': {
        const lsSubscriptionId = data.id

        const userId =
          customData?.user_id ??
          (await findUserBySubscriptionId(lsSubscriptionId))

        if (!userId) {
          console.error(`No user found for subscription_payment_failed (subscription: ${lsSubscriptionId})`)
          break
        }

        await getAdminSupabase()
          .from('subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`User ${userId} subscription payment failed — status set to expired`)
        break
      }

      // ──────────────────────────────────────────────────────
      // Payment recovered after failure — restore active status
      // ──────────────────────────────────────────────────────
      case 'subscription_payment_recovered': {
        const lsSubscriptionId = data.id

        const userId =
          customData?.user_id ??
          (await findUserBySubscriptionId(lsSubscriptionId))

        if (!userId) break

        await getAdminSupabase()
          .from('subscriptions')
          .update({
            status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        console.log(`User ${userId} subscription payment recovered — status restored to active`)
        break
      }

      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`)
        break
    }
  } catch (err) {
    console.error(`Error handling Lemon Squeezy event ${eventName}:`, err)
    return NextResponse.json({ error: 'Internal webhook handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
