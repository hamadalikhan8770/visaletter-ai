/**
 * Multi-provider AI abstraction with automatic fallback.
 *
 * Routing order (cheapest-first):
 *   1. OpenRouter free models  — 3 models tried in sequence
 *   2. Gemini 2.5 Flash-Lite   — cheap paid fallback (~$0.00003/1k tokens)
 *   3. OpenAI gpt-4o-mini      — final paid fallback (~$0.00015/1k tokens)
 *
 * A provider is skipped if its API key is not configured.
 * 429 rate-limits and empty responses trigger immediate fallback to the next provider.
 * All providers have a per-request timeout (PROVIDER_TIMEOUT_MS).
 *
 * Required env vars:
 *   OPENROUTER_API_KEY  — free at openrouter.ai
 *   GEMINI_API_KEY      — free tier at aistudio.google.com (paid beyond quota)
 *   OPENAI_API_KEY      — optional, only used when both above fail
 *
 * Cost control:
 *   MAX_DAILY_GENERATIONS — exported constant; use it in a DB daily-count check
 *   to hard-cap AI spending before it reaches paid providers.
 */

// ─── Cost control ──────────────────────────────────────────────────────────────

/**
 * Maximum AI generations allowed per day across all users.
 * Raise this as revenue grows. Implement a daily DB counter check in
 * /api/generate to enforce it before calling generateWithFallback().
 */
export const MAX_DAILY_GENERATIONS = 500

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AIResult {
  text: string
  tokensUsed: number
  provider: string
}

// ─── Config ────────────────────────────────────────────────────────────────────

/** Per-provider request timeout in milliseconds. */
const PROVIDER_TIMEOUT_MS = 30_000

/**
 * OpenRouter free models tried in priority order.
 * Reduced to 3 to keep total fallback time under ~90 s if all are rate-limited.
 * Update model IDs at https://openrouter.ai/models?q=free
 */
const OPENROUTER_FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',  // Llama 3.3 70B — best quality
  'deepseek/deepseek-v4-flash:free',          // DeepSeek V4 Flash — fast
  'google/gemma-4-31b-it:free',              // Google Gemma 4 31B — reliable
]

/** Gemini 2.5 Flash-Lite model ID. Update if Google releases a newer version. */
const GEMINI_MODEL = 'gemini-2.5-flash-lite'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions'
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENAI_BASE = 'https://api.openai.com/v1/chat/completions'

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch with a hard timeout. Throws on timeout (AbortError). */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Returns true if this error is a rate-limit signal that should trigger
 * immediate fallback to the next provider rather than a retry.
 */
function isRateLimit(status: number, bodyError?: { code?: number; message?: string }): boolean {
  if (status === 429) return true
  if (bodyError?.code === 429) return true
  const msg = (bodyError?.message ?? '').toLowerCase()
  return msg.includes('rate limit') || msg.includes('rate-limit') || msg.includes('too many requests')
}

// ─── Provider: OpenRouter (free) ───────────────────────────────────────────────

async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const apiKey = (process.env.OPENROUTER_API_KEY ?? '').trim()
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const modelErrors: string[] = []

  for (const model of OPENROUTER_FREE_MODELS) {
    try {
      const res = await fetchWithTimeout(
        OPENROUTER_BASE,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://visaletter.microtoolshub.org',
            'X-Title': 'VisaLetter.ai',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 700,
            temperature: 0.72,
          }),
        },
        PROVIDER_TIMEOUT_MS
      )

      // Fast-fail on rate limit without reading the body
      if (res.status === 429) {
        const msg = `${model} → rate-limited (429)`
        console.warn(`[OpenRouter] ${msg}`)
        modelErrors.push(msg)
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        const msg = `${model} → HTTP ${res.status}: ${errText.slice(0, 200)}`
        console.warn(`[OpenRouter] ${msg}`)
        modelErrors.push(msg)
        continue
      }

      const json = await res.json()

      // OpenRouter may embed an error object even on HTTP 200
      if (json.error) {
        const bodyErr = { code: json.error?.code, message: json.error?.message ?? JSON.stringify(json.error) }
        if (isRateLimit(res.status, bodyErr)) {
          const msg = `${model} → rate-limited (body)`
          console.warn(`[OpenRouter] ${msg}`)
          modelErrors.push(msg)
          continue
        }
        const msg = `${model} → API error: ${bodyErr.message.slice(0, 150)}`
        console.warn(`[OpenRouter] ${msg}`)
        modelErrors.push(msg)
        continue
      }

      const text: string = json.choices?.[0]?.message?.content?.trim() ?? ''

      if (!text) {
        const msg = `${model} → empty response`
        console.warn(`[OpenRouter] ${msg}`)
        modelErrors.push(msg)
        continue
      }

      return {
        text,
        tokensUsed: json.usage?.total_tokens ?? 0,
        provider: `openrouter/${model}`,
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      const msg = `${model} → ${isTimeout ? `timeout (${PROVIDER_TIMEOUT_MS / 1000}s)` : err instanceof Error ? err.message : String(err)}`
      console.warn(`[OpenRouter] ${msg}`)
      modelErrors.push(msg)
    }
  }

  throw new Error(`All OpenRouter models failed:\n${modelErrors.join('\n')}`)
}

// ─── Provider: Gemini 2.5 Flash-Lite (cheap paid) ─────────────────────────────

async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim()
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`

  let res: Response
  try {
    res = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            { role: 'user', parts: [{ text: userPrompt }] },
          ],
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.72,
          },
        }),
      },
      PROVIDER_TIMEOUT_MS
    )
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    throw new Error(isTimeout ? `Gemini timeout (${PROVIDER_TIMEOUT_MS / 1000}s)` : String(err))
  }

  if (res.status === 429) {
    throw new Error('Gemini rate-limited (429)')
  }

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini HTTP ${res.status}: ${errText.slice(0, 300)}`)
  }

  const json = await res.json()

  // Gemini API may return an error block on 200 (e.g., safety filter)
  if (json.error) {
    throw new Error(`Gemini API error: ${json.error?.message ?? JSON.stringify(json.error)}`)
  }

  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

  if (!text) {
    // Log finish reason to help diagnose safety filter blocks
    const finishReason = json.candidates?.[0]?.finishReason ?? 'unknown'
    throw new Error(`Gemini returned empty content (finishReason: ${finishReason})`)
  }

  const tokensUsed =
    (json.usageMetadata?.promptTokenCount ?? 0) +
    (json.usageMetadata?.candidatesTokenCount ?? 0)

  return {
    text,
    tokensUsed,
    provider: `gemini/${GEMINI_MODEL}`,
  }
}

// ─── Provider: OpenAI gpt-4o-mini (final paid fallback) ───────────────────────

async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const apiKey = (process.env.OPENAI_API_KEY ?? '').trim()
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')

  let res: Response
  try {
    res = await fetchWithTimeout(
      OPENAI_BASE,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 700,
          temperature: 0.72,
        }),
      },
      PROVIDER_TIMEOUT_MS
    )
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    throw new Error(isTimeout ? `OpenAI timeout (${PROVIDER_TIMEOUT_MS / 1000}s)` : String(err))
  }

  if (res.status === 429) {
    throw new Error('OpenAI rate-limited (429)')
  }

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`OpenAI HTTP ${res.status}: ${errText.slice(0, 300)}`)
  }

  const json = await res.json()
  const text: string = json.choices?.[0]?.message?.content?.trim() ?? ''

  if (!text) throw new Error('OpenAI returned empty content')

  return {
    text,
    tokensUsed: json.usage?.total_tokens ?? 0,
    provider: 'openai/gpt-4o-mini',
  }
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Generates text using configured AI providers with automatic fallback.
 *
 * Routing: OpenRouter free (3 models) → Gemini 2.5 Flash-Lite → OpenAI gpt-4o-mini
 *
 * Throws a USER-FRIENDLY error string if all providers fail.
 * Raw provider errors are only logged server-side.
 */
export async function generateWithFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const providerErrors: string[] = []

  // ── 1. OpenRouter free models ────────────────────────────────────────────────
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await generateWithOpenRouter(systemPrompt, userPrompt)
      console.log(`[AI] ✓ ${result.provider} — ${result.tokensUsed} tokens`)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      providerErrors.push(`OpenRouter: ${msg.split('\n')[0]}`) // first line only for log brevity
      console.warn('[AI] OpenRouter exhausted → trying Gemini')
    }
  } else {
    providerErrors.push('OpenRouter: OPENROUTER_API_KEY not configured')
    console.warn('[AI] Skipping OpenRouter (no key) → trying Gemini')
  }

  // ── 2. Gemini 2.5 Flash-Lite ─────────────────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await generateWithGemini(systemPrompt, userPrompt)
      console.log(`[AI] ✓ ${result.provider} — ${result.tokensUsed} tokens`)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      providerErrors.push(`Gemini: ${msg}`)
      console.warn('[AI] Gemini failed → trying OpenAI:', msg)
    }
  } else {
    providerErrors.push('Gemini: GEMINI_API_KEY not configured')
    console.warn('[AI] Skipping Gemini (no key) → trying OpenAI')
  }

  // ── 3. OpenAI gpt-4o-mini (final fallback) ───────────────────────────────────
  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await generateWithOpenAI(systemPrompt, userPrompt)
      console.log(`[AI] ✓ ${result.provider} — ${result.tokensUsed} tokens`)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      providerErrors.push(`OpenAI: ${msg}`)
      console.error('[AI] OpenAI failed (all providers exhausted):', msg)
    }
  } else {
    providerErrors.push('OpenAI: OPENAI_API_KEY not configured')
    console.warn('[AI] Skipping OpenAI (no key)')
  }

  // All providers failed — log details server-side, surface friendly message
  console.error('[AI] All providers failed:\n' + providerErrors.join('\n'))
  throw new Error('Our AI service is temporarily busy. Please try again in a moment.')
}
