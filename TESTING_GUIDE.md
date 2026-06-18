# TESTING_GUIDE

## Verified commands

```powershell
npm install
Copy-Item .env.example .env.local
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
- AI generation and billing routes were not exercised with live credentials in this audit pass
