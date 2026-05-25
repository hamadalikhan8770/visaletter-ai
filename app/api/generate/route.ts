import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateWithFallback } from '@/lib/ai-providers'
import { PLAN_LIMITS, type Plan } from '@/types'

const SYSTEM_PROMPT = `You are a professional career consultant and cover letter specialist with 15 years of experience helping international applicants secure visa-sponsored employment in the UK, Canada, and Australia.

Your cover letters must be:
- Professional
- Confident
- Specific to the job description
- Suitable for international applicants
- Between 280 and 350 words
- Structured in exactly 4 paragraphs
- No generic clichés like "I am writing to apply" or "Please find attached"
- No desperate tone
- No apologetic language about being international
- No fake experience or unsupported claims
- No mention of "hardworking" or "team player" as standalone traits

Do not mention visa sponsorship unless the user explicitly states they require sponsorship OR the job description mentions sponsorship.

Output only the final cover letter text. No markdown formatting. No bullet points. Plain text paragraphs only. No salutation or sign-off unless natural.`

function buildUserPrompt(data: Record<string, string>): string {
  return `Generate a professional cover letter for the following applicant:

Name: ${data.fullName || 'The Applicant'}
Current Country: ${data.currentCountry || 'Not specified'}
Target Country: ${data.targetCountry || 'Not specified'}
Current Role / Job Title: ${data.currentRole || 'Not specified'}
Years of Experience: ${data.yearsExperience || 'Not specified'}
Top Skills: ${data.skills || 'Not specified'}
Education: ${data.education || 'Not specified'}
Visa Status: ${data.visaStatus === 'requires_sponsorship' ? 'Requires employer sponsorship' : data.visaStatus === 'has_right_to_work' ? 'Already has the right to work' : data.visaStatus === 'student_visa' ? 'Currently on a student visa' : data.visaStatus === 'applying_for_pr' ? 'Applying for permanent residency' : 'Prefer not to mention visa status'}
Preferred Tone: ${data.tone || 'formal'}

Job Description:
${data.jobDescription}`
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()

  // Authenticated Supabase client (respects RLS — for reading user data)
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  // Admin client — bypasses RLS for writes (subscription counter, saving generation)
  const adminSupabase = createClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim(),
    (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
  )

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
  }

  // Parse body
  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (!body.jobDescription?.trim()) {
    return NextResponse.json({ error: 'Job description is required.' }, { status: 400 })
  }
  if (!body.currentRole?.trim()) {
    return NextResponse.json({ error: 'Current role is required.' }, { status: 400 })
  }

  // Get subscription
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (subError || !subscription) {
    return NextResponse.json({ error: 'Subscription record not found.' }, { status: 404 })
  }

  // Check if billing period has reset
  const now = new Date()
  const periodEnd = new Date(subscription.current_period_end)

  if (now > periodEnd) {
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    await adminSupabase
      .from('subscriptions')
      .update({
        generations_used: 0,
        current_period_start: now.toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('user_id', user.id)

    subscription.generations_used = 0
  }

  // Check generation limit
  const plan = subscription.plan as Plan
  const limit = PLAN_LIMITS[plan]

  if (limit !== -1 && subscription.generations_used >= limit) {
    return NextResponse.json(
      {
        error: `You have reached your ${limit}-letter monthly limit on the ${plan} plan.`,
        upgrade: true,
      },
      { status: 403 }
    )
  }

  // Generate with multi-provider fallback (OpenRouter free → Gemini 2.5 Flash-Lite → OpenAI gpt-4o-mini)
  let outputText: string
  let tokensUsed = 0

  try {
    const result = await generateWithFallback(SYSTEM_PROMPT, buildUserPrompt(body))
    outputText = result.text
    tokensUsed = result.tokensUsed

    if (!outputText) {
      return NextResponse.json(
        { error: 'Our AI service is temporarily busy. Please try again in a moment.' },
        { status: 500 }
      )
    }
  } catch (err: unknown) {
    // generateWithFallback already logs full provider details server-side.
    // Surface a clean, user-friendly message — never expose raw API errors.
    const message = err instanceof Error ? err.message : 'Our AI service is temporarily busy. Please try again in a moment.'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // Save generation
  const { data: generation, error: saveError } = await adminSupabase
    .from('generations')
    .insert({
      user_id: user.id,
      full_name: body.fullName || null,
      current_country: body.currentCountry || null,
      target_country: body.targetCountry || null,
      current_role: body.currentRole || null,
      years_experience: body.yearsExperience || null,
      skills: body.skills || null,
      education: body.education || null,
      visa_status: body.visaStatus || null,
      tone: body.tone || 'formal',
      job_description: body.jobDescription,
      output_text: outputText,
      tokens_used: tokensUsed,
    })
    .select()
    .single()

  if (saveError) {
    console.error('Save generation error:', saveError)
    // Still return the output even if save fails
  }

  // Increment usage counter
  const newUsed = subscription.generations_used + 1
  await adminSupabase
    .from('subscriptions')
    .update({ generations_used: newUsed, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  return NextResponse.json({
    id: generation?.id ?? '',
    outputText,
    generationsUsed: newUsed,
    generationsLimit: limit,
  })
}
