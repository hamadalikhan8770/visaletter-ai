# PROJECT_SUMMARY

## Project type

Next.js SaaS-style web app with Supabase-backed auth and AI-assisted cover letter generation.

## What is verified

- App Router pages are tracked for landing, auth, dashboard, generation, history, and pricing
- API routes are tracked for checkout, generation, generation history, and Lemon Squeezy webhook handling
- `npm install`, `npm run lint`, and `npm run build` all passed during the June 18, 2026 live environment pass
- Local runtime passed on `http://127.0.0.1:3011`
- Route checks passed for `/`, `/login`, and `/signup`
- Protected routes `/dashboard` and `/generate` redirected correctly to auth when no session was present
- `npm run build` passed during this audit
- Real screenshots were captured from the local running app

## What is incomplete or pending

- Protected routes require a real authenticated session for full walkthroughs
- AI provider execution is Not verified yet with live keys
- Billing and webhook behavior are Not verified yet with live services

## Screenshot status

Added real screenshots to `docs/images/` for landing, login, signup, and protected-route redirect state.

## Live credential requirements

The app boots without live secrets, but full product verification requires:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

AI generation requires at least one real provider key:

- `OPENROUTER_API_KEY`
- or `OPENAI_API_KEY`
- or `GEMINI_API_KEY`

Billing verification additionally requires live Lemon Squeezy values:

- `LEMONSQUEEZY_API_KEY`
- `LEMONSQUEEZY_WEBHOOK_SECRET`
- `LEMONSQUEEZY_STORE_ID`
- `LEMONSQUEEZY_BASIC_VARIANT_ID`
- `LEMONSQUEEZY_PRO_VARIANT_ID`
