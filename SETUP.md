# VisaLetter.ai — Complete Setup & Deployment Guide (Lemon Squeezy)

Payments are handled entirely by Lemon Squeezy. There is no Stripe code anywhere in this project.

---

## What You Will Have After This Guide

A fully deployed SaaS at a live URL with:
- User signup and login (Supabase)
- AI cover letter generation (OpenAI)
- PDF download (jsPDF)
- Lemon Squeezy subscription billing (Basic $9/mo, Pro $19/mo)
- Automatic plan upgrades, cancellations, and downgrades via webhooks

Estimated time: 45–90 minutes for a first-time setup.

---

## Prerequisites

Install these before starting:

1. **Node.js 18+** — https://nodejs.org (download LTS version)
2. **Git** — https://git-scm.com
3. A free **Supabase** account — https://supabase.com
4. A free **OpenAI** account with API access — https://platform.openai.com
5. A **Lemon Squeezy** account — https://lemonsqueezy.com
6. A free **Vercel** account — https://vercel.com

---

## Step 1 — Install Dependencies

Open a terminal in the `visaletter-ai` folder and run:

```bash
npm install
```

This installs all packages. No Stripe packages are installed.

---

## Step 2 — Set Up Supabase

### 2a. Create a Project

1. Go to https://supabase.com and log in
2. Click **New Project**
3. Name it `visaletter-ai`
4. Choose a region close to your users (e.g., `eu-west-2` for UK users)
5. Set a strong database password
6. Click **Create new project** — wait 1–2 minutes

### 2b. Run the Database Schema

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open `supabase/schema.sql` from this project folder
4. Copy everything and paste into the SQL editor
5. Click **Run**
6. You should see: "Success. No rows returned."

This creates all tables (`profiles`, `subscriptions`, `generations`, `payments`), indexes, RLS policies, and the trigger that auto-creates a free subscription when a user signs up.

### 2c. Disable Email Confirmation (for local testing)

1. Go to **Authentication → Providers → Email**
2. Toggle OFF **Confirm email**
3. Click **Save**

Re-enable this before going live to real users.

### 2d. Get Your API Keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** secret → `SUPABASE_SERVICE_ROLE_KEY`

The service_role key bypasses RLS — only use it in server-side API routes. Never expose it in the browser.

---

## Step 3 — Set Up OpenAI

1. Go to https://platform.openai.com/api-keys
2. Click **+ Create new secret key**, name it `visaletter-ai`
3. Copy the key → `OPENAI_API_KEY`
4. Add $5–10 credits at https://platform.openai.com/settings/billing

At gpt-4o-mini pricing (~$0.15 per 1M input tokens), each generation costs ~$0.0002. $5 covers 25,000 generations.

---

## Step 4 — Set Up Lemon Squeezy

### 4a. Create Your Store

1. Go to https://app.lemonsqueezy.com and sign up / log in
2. Complete store setup (name, currency, etc.)
3. Go to **Settings → Stores** — copy your **Store ID** (a number like `12345`) → `LEMONSQUEEZY_STORE_ID`

### 4b. Create the Two Products

**Product 1 — Basic Plan**

1. Go to **Products → Add product**
2. Name: `VisaLetter Basic`
3. Pricing: **Subscription** → `$9.00 USD` → **Monthly**
4. Save the product
5. Click on the product → click on the variant → copy the **Variant ID** (a number like `67890`) → `LEMONSQUEEZY_BASIC_VARIANT_ID`

**Product 2 — Pro Plan**

1. Repeat the same steps
2. Name: `VisaLetter Pro`, Price: `$19.00 USD` monthly
3. Copy the **Variant ID** → `LEMONSQUEEZY_PRO_VARIANT_ID`

### 4c. Get Your API Key

1. Go to **Settings → API**
2. Click **+ Generate new API key**
3. Name it `visaletter-ai`, copy the key → `LEMONSQUEEZY_API_KEY`

### 4d. Set Up Webhook (Production)

You will do this AFTER deploying to Vercel (Step 7). Come back here once you have your live URL.

1. Go to **Settings → Webhooks**
2. Click **+ Add webhook**
3. URL: `https://your-vercel-url.vercel.app/api/webhooks/lemonsqueezy`
4. Select these events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_expired`
   - `subscription_payment_success`
   - `subscription_payment_failed`
   - `subscription_payment_recovered`
5. Click **Save**
6. Copy the **Signing Secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`

### 4e. Local Webhook Testing (Optional but Recommended)

Lemon Squeezy does not have an official CLI for local webhooks, but you can use a tunnel:

**Option A — ngrok (free)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
# Copy the https URL, e.g. https://abc123.ngrok.io
# Create a webhook in LS pointing to https://abc123.ngrok.io/api/webhooks/lemonsqueezy
```

**Option B — LocalTunnel**
```bash
npx localtunnel --port 3000
# Copy the URL given and use it as the webhook endpoint in LS
```

Set the local webhook signing secret as `LEMONSQUEEZY_WEBHOOK_SECRET` in `.env.local`.

---

## Step 5 — Create Your .env.local File

In the project root, create `.env.local`. Copy `.env.example` and fill in all values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-proj-...

LEMONSQUEEZY_API_KEY=eyJ...
LEMONSQUEEZY_WEBHOOK_SECRET=whs_...
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_BASIC_VARIANT_ID=67890
LEMONSQUEEZY_PRO_VARIANT_ID=67891

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env.local` is in `.gitignore` by default — never commit it.

---

## Step 6 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000

Test the full flow:
1. Click **Get started free** → create an account → redirected to dashboard
2. Click **Generate Cover Letter** → fill form → click Generate
3. Letter appears → copy or (if upgraded) download PDF
4. Click **Pricing** → click Upgrade → Lemon Squeezy checkout opens
5. Complete checkout → redirected to `/dashboard?success=true`
6. Dashboard shows new plan badge and generation limit

---

## Step 7 — Deploy to Vercel

### 7a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — VisaLetter.ai MVP"
# Create repo at github.com/new, then:
git remote add origin https://github.com/YOUR_USERNAME/visaletter-ai.git
git branch -M main
git push -u origin main
```

### 7b. Import on Vercel

1. Go to https://vercel.com → **Add New → Project**
2. Import your `visaletter-ai` repository
3. Vercel auto-detects Next.js — leave settings as is
4. Click **Environment Variables** and add all 10 variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_WEBHOOK_SECRET        ← use a placeholder for now, update after webhook is created
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_BASIC_VARIANT_ID
LEMONSQUEEZY_PRO_VARIANT_ID
NEXT_PUBLIC_SITE_URL               ← set to your Vercel URL, e.g. https://visaletter-ai.vercel.app
```

5. Click **Deploy** — wait 1–2 minutes

### 7c. Create the Production Webhook

1. Copy your Vercel URL: `https://visaletter-ai.vercel.app`
2. Follow Step 4d above to create the webhook in Lemon Squeezy with this URL
3. Copy the Signing Secret
4. Go to Vercel → your project → **Settings → Environment Variables**
5. Update `LEMONSQUEEZY_WEBHOOK_SECRET` with the real signing secret
6. Go to **Deployments → redeploy** (or push a new commit) to pick up the new secret

### 7d. Update NEXT_PUBLIC_SITE_URL

Make sure `NEXT_PUBLIC_SITE_URL` is set to your exact Vercel URL (or custom domain) in Vercel's environment variables. This is the URL users get redirected to after checkout.

---

## Testing Checklist

### Authentication
- [ ] Signup with new email → lands on dashboard
- [ ] Logout → lands on landing page
- [ ] Visit /dashboard without login → redirected to /login
- [ ] Login with wrong password → shows error message
- [ ] Login with correct credentials → dashboard

### AI Generation
- [ ] Submit form with empty job description → validation error shown
- [ ] Submit valid form → letter generated within 10 seconds
- [ ] Letter appears on screen correctly
- [ ] Letter saved — appears in /history
- [ ] Usage counter in dashboard decreases after each generation
- [ ] Generate 3 letters on free plan → 4th attempt shows limit error with upgrade link
- [ ] Click Regenerate → produces a new version

### PDF Download
- [ ] On free plan → PDF button shows "upgrade" label, not a download
- [ ] On Basic/Pro plan → PDF file downloads with correct filename
- [ ] PDF contains the correct cover letter text

### Payments (Lemon Squeezy)
- [ ] Click "Start Basic" on pricing page → Lemon Squeezy checkout page opens
- [ ] Click "Start Pro" on pricing page → checkout opens with correct Pro price
- [ ] Complete test checkout with test card → redirected to /dashboard?success=true
- [ ] Dashboard shows "Basic" or "Pro" badge after successful payment
- [ ] Generation limit is updated (20 for Basic, unlimited for Pro)
- [ ] Webhook fires and updates Supabase → check Supabase table editor → subscriptions

### Subscription Lifecycle
- [ ] Cancel subscription in Lemon Squeezy → webhook fires → status set to "cancelled" in Supabase
- [ ] Wait for subscription to expire → webhook fires → plan downgraded to "free"
- [ ] Payment failure → status set to "expired"
- [ ] Payment recovery → status restored to "active"

### Dashboard
- [ ] Plan badge shows correct plan
- [ ] Generation counter shows correct remaining count
- [ ] Recent letters show last 3 generations
- [ ] Empty state shows "Generate your first letter" CTA

### History Page
- [ ] All letters listed with date, role, and country
- [ ] Expand button shows full letter text
- [ ] Copy button works
- [ ] Download PDF works on paid plans
- [ ] Free plan shows upgrade button instead of download

---

## Lemon Squeezy Test Cards

In your Lemon Squeezy store, enable **Test Mode** under Settings.

Test card for successful payment:
```
Card number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
```

Test card for declined payment:
```
Card number: 4000 0000 0000 0002
```

---

## Common Errors and Fixes

### "LEMONSQUEEZY_API_KEY environment variable is not set"
→ `.env.local` is missing or the variable name has a typo
→ Restart the dev server after editing `.env.local` (Ctrl+C then `npm run dev`)

### "LEMONSQUEEZY_BASIC_VARIANT_ID environment variable is not set"
→ Go to Lemon Squeezy → Products → click your Basic product → open the Variant → copy the numeric ID
→ It should look like `67890`, NOT a URL

### "Lemon Squeezy checkout creation failed (422)"
→ The Store ID or Variant ID is wrong
→ Double-check LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_BASIC_VARIANT_ID
→ Make sure Store ID is a number, not a slug

### "Invalid signature" in webhook
→ The `LEMONSQUEEZY_WEBHOOK_SECRET` does not match the signing secret in the LS dashboard
→ For production: go to LS → Webhooks → your endpoint → copy Signing Secret
→ For local: copy the signing secret shown when you created the local webhook

### "Subscription record not found" after signup
→ The `on_auth_user_created` trigger did not run
→ Check: Supabase → Database → Functions → look for `handle_new_user`
→ If missing, re-run `supabase/schema.sql` in the SQL Editor
→ Delete the test user and sign up again

### Checkout opens but plan does not upgrade after payment
→ The webhook is not reaching your server
→ Production: check LS → Settings → Webhooks → your endpoint → Recent Events — look for errors
→ Make sure `NEXT_PUBLIC_SITE_URL` in Vercel matches your actual domain exactly
→ Redeploy after updating environment variables

### TypeScript error: "Property X does not exist on type"
→ Run `npm run build` to see all errors at once
→ Check `types/index.ts` — the Subscription interface uses `lemonsqueezy_*` fields, not `stripe_*`

### PDF download does nothing
→ Open browser devtools console — look for jsPDF errors
→ Confirm the user is on Basic or Pro plan (free plan shows upgrade button instead)
→ Make sure `jspdf` is installed: `npm list jspdf`

---

## Folder Structure

```
visaletter-ai/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx             — Login form
│   │   └── signup/page.tsx            — Signup form
│   ├── (protected)/
│   │   ├── layout.tsx                 — Server auth guard
│   │   ├── dashboard/page.tsx         — Dashboard
│   │   ├── generate/page.tsx          — Cover letter generator
│   │   └── history/page.tsx           — Letter history
│   ├── api/
│   │   ├── generate/route.ts          — POST: AI generation
│   │   ├── generations/route.ts       — GET: fetch history
│   │   ├── checkout/route.ts          — POST: Lemon Squeezy checkout
│   │   └── webhooks/
│   │       └── lemonsqueezy/route.ts  — POST: webhook handler
│   ├── pricing/page.tsx               — Pricing page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                       — Landing page
├── components/
│   ├── ui/ (Button, Card, Input, Select, Textarea)
│   ├── Footer.tsx
│   └── Navbar.tsx
├── lib/
│   ├── lemonsqueezy.ts                — LS checkout + helpers (NO Stripe)
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   └── utils.ts
├── types/index.ts                     — TypeScript types (LS fields, no Stripe)
├── supabase/schema.sql                — DB schema with lemonsqueezy_* columns
├── middleware.ts
├── .env.example
└── SETUP.md
```

---

## Going Live

1. Switch Lemon Squeezy to **Live Mode** in store settings
2. Re-create the Basic and Pro products in Live mode (new Variant IDs)
3. Generate a new API key in Live mode
4. Create a new webhook endpoint in Live mode pointing to your Vercel URL
5. Update ALL Lemon Squeezy environment variables in Vercel with the live values
6. Re-enable email confirmation in Supabase → Authentication → Providers → Email
7. Test with a real card before announcing to users

---

## Adding a Custom Domain

1. Buy a domain (Namecheap, Porkbun, Cloudflare)
2. Vercel → your project → Settings → Domains → add your domain
3. Follow the DNS setup instructions Vercel shows
4. Update `NEXT_PUBLIC_SITE_URL` in Vercel to your new domain
5. Update the Lemon Squeezy webhook URL to your new domain
