/**
 * Lemon Squeezy integration helpers.
 * All payment logic — checkout, subscriptions, plan mapping — lives here.
 */

export const LS_API_URL = 'https://api.lemonsqueezy.com/v1'

/** Returns authorization and content-type headers for the Lemon Squeezy REST API. */
export function getLSHeaders(): Record<string, string> {
  if (!process.env.LEMONSQUEEZY_API_KEY) {
    throw new Error('LEMONSQUEEZY_API_KEY environment variable is not set')
  }
  return {
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    'Content-Type': 'application/vnd.api+json',
    Accept: 'application/vnd.api+json',
  }
}

/** Returns the Lemon Squeezy Variant ID for a given plan. */
export function getVariantId(plan: 'basic' | 'pro'): string {
  const variantId =
    plan === 'basic'
      ? process.env.LEMONSQUEEZY_BASIC_VARIANT_ID
      : process.env.LEMONSQUEEZY_PRO_VARIANT_ID

  if (!variantId) {
    throw new Error(
      `LEMONSQUEEZY_${plan.toUpperCase()}_VARIANT_ID environment variable is not set`
    )
  }
  return variantId
}

/**
 * Maps a Lemon Squeezy Variant ID back to a plan name.
 * Returns null if the variant ID is unrecognised.
 */
export function getPlanFromVariantId(variantId: string | number): 'basic' | 'pro' | null {
  const id = String(variantId)
  if (id === process.env.LEMONSQUEEZY_BASIC_VARIANT_ID) return 'basic'
  if (id === process.env.LEMONSQUEEZY_PRO_VARIANT_ID) return 'pro'
  return null
}

/**
 * Creates a Lemon Squeezy hosted checkout session.
 * Returns the checkout URL to redirect the user to.
 */
export async function createCheckoutSession({
  userEmail,
  userId,
  plan,
  redirectUrl,
}: {
  userEmail: string
  userId: string
  plan: 'basic' | 'pro'
  redirectUrl: string
}): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID
  if (!storeId) throw new Error('LEMONSQUEEZY_STORE_ID environment variable is not set')

  const variantId = getVariantId(plan)

  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        checkout_data: {
          email: userEmail,
          custom: {
            user_id: userId,
            plan,
          },
        },
        product_options: {
          redirect_url: redirectUrl,
        },
        checkout_options: {
          embed: false,
          media: false,
          logo: true,
        },
      },
      relationships: {
        store: {
          data: {
            type: 'stores',
            id: String(storeId),
          },
        },
        variant: {
          data: {
            type: 'variants',
            id: String(variantId),
          },
        },
      },
    },
  }

  const response = await fetch(`${LS_API_URL}/checkouts`, {
    method: 'POST',
    headers: getLSHeaders(),
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Lemon Squeezy checkout creation failed (${response.status}): ${errorText}`)
  }

  const json = await response.json()
  const checkoutUrl: string | undefined = json?.data?.attributes?.url

  if (!checkoutUrl) {
    throw new Error('Lemon Squeezy returned no checkout URL')
  }

  return checkoutUrl
}
