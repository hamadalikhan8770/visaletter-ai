/**
 * Multi-provider AI abstraction with automatic fallback.
 *
 * Routing order (cheapest-first):
 *   1. OpenRouter free slots — each model has its OWN dedicated API key
 *        Slot 1: MiniMax M2.5          (OPENROUTER_API_KEY_1)
 *        Slot 2: DeepSeek V4 Flash     (OPENROUTER_API_KEY_2)
 *        Slot 3: Arcee Trinity Large   (OPENROUTER_API_KEY_3)
 *        Slot 4: Llama 3.3 70B        (OPENROUTER_API_KEY — shared fallback key)
 *        Slot 5: Gemma 4 31B          (OPENROUTER_API_KEY — shared fallback key)
 *   2. Gemini 1.5 Flash   — cheap paid fallback (GEMINI_API_KEY)
 *   3. OpenAI gpt-4o-mini — final paid fallback  (OPENAI_API_KEY)
 *
 * A slot/provider is skipped if its API key env var is not set.
 * 429 rate-limits and empty responses trigger immediate fallback to the next slot.
 * All providers have a per-request timeout (PROVIDER_TIMEOUT_MS).
 *
 * Required env vars:
 *   OPENROUTER_API_KEY_1  — MiniMax M2.5 dedicated key
 *   OPENROUTER_API_KEY_2  — DeepSeek V4 Flash dedicated key
 *   OPENROUTER_API_KEY_3  — Arcee Trinity dedicated key
 *   OPENROUTER_API_KEY    — shared fallback key (Llama 3.3, Gemma 4)
 *   GEMINI_API_KEY        — Google AI Studio key
 *   OPENAI_API_KEY        — optional final fallback
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

interface OpenRouterSlot {
  /** OpenRouter model ID */
  model: string
  /** Name of the env var that holds the API key for this slot */
  apiKeyEnv: string
  /** Human-readable label for logs */
  label: string
}

// ─── Config ────────────────────────────────────────────────────────────────────

/** Per-provider request timeout in milliseconds. */
const PROVIDER_TIMEOUT_MS = 30_000

/**
 * OpenRouter slots — each slot has its own dedicated API key so rate limits
 * are fully independent. Slots 4-5 share OPENROUTER_API_KEY as a fallback pool.
 */
const OPENROUTER_SLOTS: OpenRouterSlot[] = [
  {
    model: 'minimax/minimax-m2.5:free',
    apiKeyEnv: 'OPENROUTER_API_KEY_1',
    label: 'MiniMax M2.5',
  },
  {
    model: 'deepseek/deepseek-v4-flash:free',
    apiKeyEnv: 'OPENROUTER_API_KEY_2',
    label: 'DeepSeek V4 Flash',
  },
  {
    model: 'arcee-ai/arcee-trinity-large-thinking:free',
    apiKeyEnv: 'OPENROUTER_API_KEY_3',
    label: 'Arcee Trinity',
  },
  {
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    label: 'Llama 3.3 70B',
  },
  {
    model: 'google/gemma-4-31b-it:free',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    label: 'Gemma 4 31B',
  },
]

/** Gemini model ID. */
const GEMINI_MODEL = 'gemini-1.5-flash'

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

// ─── Provider: OpenRouter (slot-based, free) ───────────────────────────────────

/**
 * Tries each OpenRouter slot in order. Each slot uses its own dedicated API key
 * so rate limits don't bleed across slots.
 * Skips a slot if its API key env var is not set.
 */
async function generateWithOpenRouter(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const slotErrors: string[] = []

  for (const slot of OPENROUTER_SLOTS) {
    const apiKey = (process.env[slot.apiKeyEnv] ?? '').trim()

    if (!apiKey) {
      const msg = `${slot.label} → ${slot.apiKeyEnv} not set, skipping`
      console.warn(`[OpenRouter] ${msg}`)
      slotErrors.push(msg)
      continue
    }

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
            model: slot.model,
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
        const msg = `${slot.label} → rate-limited (429)`
        console.warn(`[OpenRouter] ${msg}`)
        slotErrors.push(msg)
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        const msg = `${slot.label} → HTTP ${res.status}: ${errText.slice(0, 200)}`
        console.warn(`[OpenRouter] ${msg}`)
        slotErrors.push(msg)
        continue
      }

      const json = await res.json()

      // OpenRouter may embed an error object even on HTTP 200
      if (json.error) {
        const bodyErr = { code: json.error?.code, message: json.error?.message ?? JSON.stringify(json.error) }
        if (isRateLimit(res.status, bodyErr)) {
          const msg = `${slot.label} → rate-limited (body)`
          console.warn(`[OpenRouter] ${msg}`)
          slotErrors.push(msg)
          continue
        }
        const msg = `${slot.label} → API error: ${bodyErr.message.slice(0, 150)}`
        console.warn(`[OpenRouter] ${msg}`)
        slotErrors.push(msg)
        continue
      }

      const text: string = json.choices?.[0]?.message?.content?.trim() ?? ''

      if (!text) {
        const msg = `${slot.label} → empty response`
        console.warn(`[OpenRouter] ${msg}`)
        slotErrors.push(msg)
        continue
      }

      return {
        text,
        tokensUsed: json.usage?.total_tokens ?? 0,
        provider: `openrouter/${slot.model}`,
      }
    } catch (err) {
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      const msg = `${slot.label} → ${isTimeout ? `timeout (${PROVIDER_TIMEOUT_MS / 1000}s)` : err instanceof Error ? err.message : String(err)}`
      console.warn(`[OpenRouter] ${msg}`)
      slotErrors.push(msg)
    }
  }

  throw new Error(`All OpenRouter slots failed:\n${slotErrors.join('\n')}`)
}

// ─── Provider: Gemini 1.5 Flash (cheap paid) ──────────────────────────────────

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
 * Routing:
 *   OpenRouter slots (5 models, each with own key) → Gemini 1.5 Flash → OpenAI gpt-4o-mini
 *
 * Throws a USER-FRIENDLY error string if all providers fail.
 * Raw provider errors are only logged server-side.
 */
export async function generateWithFallback(
  systemPrompt: string,
  userPrompt: string
): Promise<AIResult> {
  const providerErrors: string[] = []

  // ── 1. OpenRouter free slots ─────────────────────────────────────────────────
  const hasAnyOpenRouterKey =
    process.env.OPENROUTER_API_KEY_1 ||
    process.env.OPENROUTER_API_KEY_2 ||
    process.env.OPENROUTER_API_KEY_3 ||
    process.env.OPENROUTER_API_KEY

  if (hasAnyOpenRouterKey) {
    try {
      const result = await generateWithOpenRouter(systemPrompt, userPrompt)
      console.log(`[AI] ✓ ${result.provider} — ${result.tokensUsed} tokens`)
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      providerErrors.push(`OpenRouter: ${msg.split('\n')[0]}`)
      console.warn('[AI] OpenRouter exhausted → trying Gemini')
    }
  } else {
    providerErrors.push('OpenRouter: no keys configured')
    console.warn('[AI] Skipping OpenRouter (no keys) → trying Gemini')
  }

  // ── 2. Gemini 1.5 Flash ──────────────────────────────────────────────────────
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
