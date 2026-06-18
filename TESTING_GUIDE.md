# TESTING_GUIDE

## Verified commands

```powershell
npm install
Copy-Item .env.example .env.local
npm run lint
npm run build
npm run start -- --hostname 127.0.0.1 --port 3001
```

## Routes checked

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/generate`

## Notes

- `/dashboard` and `/generate` redirected to the login screen without an authenticated Supabase session
- `npm run lint` passed after adding a standard non-interactive ESLint config and stabilizing Supabase client usage in protected pages
- AI generation and billing routes were not exercised with live credentials in this audit pass
- Real environment variables required for end-to-end verification:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_SITE_URL`
  - one live AI provider key set such as `OPENROUTER_API_KEY` or `OPENAI_API_KEY`
- Lemon Squeezy checkout and webhook testing require live billing credentials
