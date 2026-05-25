'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Trim keys defensively — a trailing newline or BOM in the env var causes
  // "String contains non ISO-8859-1 code point" on the fetch Authorization header.
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  return createBrowserClient(url, key)
}
