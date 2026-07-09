# 💌 VisaLetter.ai

> **AI-Powered Cover Letter Generator for Global Job Seekers**  
> Generate visa-aware, tailored cover letters that help international professionals land dream jobs worldwide

[![Live Demo](https://img.shields.io/badge/Live%20Demo-VisaLetter.ai-green?style=flat-square&logo=vercel)](https://visaletter-ai.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-@hamadalikhan8770-blue?style=flat-square&logo=github)](https://github.com/hamadalikhan8770/visaletter-ai)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)

---

## ✨ Features

### 🤖 **AI-Powered Generation**
- Generate professional cover letters with AI assistance
- Visa category-aware personalization
- Multiple industry templates
- OpenAI & OpenRouter integration

### 🌍 **Visa-Aware Intelligence**
- Customized letters based on visa categories:
  - Work visa (H1B, Skilled Migration, etc.)
  - Student visa to work transition
  - Entrepreneur/Startup visa
  - Sponsor preference indication
- Country-specific content optimization

### 📱 **Full-Stack App**
- Responsive landing page with pricing info
- User authentication (Supabase)
- Protected dashboard with generation history
- PDF export functionality
- Payment processing (Lemon Squeezy)

### 💾 **Secure & Private**
- End-to-end encrypted communication
- Secure Supabase authentication
- No data sharing with third parties
- GDPR compliant

### 💰 **Flexible Pricing**
- Free tier with limited generations
- Tiered subscription plans
- One-time purchases available
- Stripe/Lemon Squeezy integration

---

## 🎯 Problem Solved

International job seekers face unique challenges:
- ❌ Generic cover letters don't highlight visa sponsorship readiness
- ❌ Existing tools ignore visa category requirements
- ❌ Time-consuming manual customization for each application

**VisaLetter.ai** solves this by:
✅ Generating visa-aware cover letters in seconds  
✅ Highlighting relevant visa sponsorship information  
✅ Tailoring content to specific job requirements  
✅ Increasing chances of landing interviews globally

---

## 🏗️ Architecture

```
visaletter-ai/
├── app/                      # Next.js App Router (14)
│   ├── page.tsx             # Landing/home page
│   ├── pricing/             # Pricing page
│   ├── auth/                # Auth pages (login, signup)
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── generate/        # Letter generation
│   │   └── history/         # Previous letters
│   └── api/                 # API routes
│       ├── generate         # AI generation endpoint
│       ├── history          # Letter history
│       ├── checkout         # Payment checkout
│       └── webhooks         # Lemon Squeezy webhooks
├── lib/
│   ├── ai-providers.ts      # OpenAI/OpenRouter integration
│   ├── supabase/            # Supabase client & server
│   └── types.ts             # TypeScript types
├── components/
│   ├── layout/              # Header, footer, navigation
│   ├── auth/                # Auth components
│   ├── forms/               # Input forms
│   └── ui/                  # Reusable UI components
├── public/                  # Static assets
└── .env.example             # Environment template
```

### Data Flow

1. **User lands on marketing site** → Pricing & features visible
2. **Sign up/Login** → Supabase auth flow
3. **Enter job details** → User provides job description, visa category, preferences
4. **AI Generation** → OpenAI/OpenRouter creates tailored letter
5. **Download** → PDF export or copy to clipboard
6. **Payment** → Lemon Squeezy handles billing
7. **History** → All generated letters saved in Supabase

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)
- OpenAI or OpenRouter API key
- Lemon Squeezy account (for payments)

### Installation

```bash
# Clone repository
git clone https://github.com/hamadalikhan8770/visaletter-ai.git
cd visaletter-ai

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Provider (choose one)
OPENROUTER_API_KEY=sk-or-xxx
# OR
OPENAI_API_KEY=sk-xxx

# Payments
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=YOUR_STORE_ID
LEMON_SQUEEZY_API_KEY=YOUR_API_KEY

# Optional
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
```

### Development

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
```

### Build & Deploy

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

---

## 📱 Screenshots

### Landing Page
![VisaLetter Home](./docs/images/home.png)

### Login Page
![VisaLetter Login](./docs/images/login.png)

### Signup Page
![VisaLetter Signup](./docs/images/signup.png)

### Dashboard
![VisaLetter Dashboard](./docs/images/dashboard.png)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Next.js 14, TypeScript 5.5 |
| **Styling** | Tailwind CSS, PostCSS |
| **Backend/DB** | Supabase (PostgreSQL), Edge Functions |
| **Authentication** | Supabase Auth (OAuth + Email/Password) |
| **AI** | OpenAI GPT-4 / OpenRouter |
| **Payments** | Lemon Squeezy |
| **Export** | jsPDF (PDF generation) |
| **Hosting** | Vercel (recommended) |
| **Monitoring** | Google Analytics (optional) |

---

## 📖 How It Works

### Step 1: User Registration
- Sign up with email or social OAuth
- Supabase handles secure authentication

### Step 2: Enter Job Details
```typescript
interface JobDetails {
  jobTitle: string;
  company: string;
  jobDescription: string;
  visaCategory: 'h1b' | 'skilled' | 'startup' | 'student' | 'other';
  yearsExperience: number;
  skills: string[];
  additionalInfo?: string;
}
```

### Step 3: AI Generation
```typescript
// API call to /api/generate
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify(jobDetails),
});

// Returns generated cover letter
const letter = await response.json();
```

### Step 4: Export & Apply
- Download as PDF
- Copy to clipboard
- Share via email
- Save for later reference

---

## 💳 Pricing Model

- **Free Tier:** 2 generations/month
- **Starter:** $9.99/month - 20 generations
- **Professional:** $24.99/month - Unlimited generations
- **One-time:** $2.99 per generation

*Subscriptions auto-renew; cancel anytime*

---

## 🔧 Development

### Adding a New Visa Category

1. Update `lib/types.ts`:
```typescript
type VisaCategory = 'h1b' | 'skilled' | 'startup' | 'student' | 'new_visa';
```

2. Update AI prompt in `/api/generate`

3. Add UI option in components

### Database Schema

Letters are stored in Supabase:
```sql
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  job_title VARCHAR,
  company VARCHAR,
  visa_category VARCHAR,
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow
```bash
1. Fork the repository
2. Create feature branch: git checkout -b feature/amazing-feature
3. Commit changes: git commit -m 'Add amazing feature'
4. Push to branch: git push origin feature/amazing-feature
5. Open Pull Request
```

---

## 📊 Performance

✅ **Lighthouse Scores:** 95+  
✅ **Build Time:** ~30 seconds  
✅ **Cold Start:** <200ms  
✅ **Type Coverage:** 100% TypeScript  

---

## 🔒 Security

- ✅ Supabase Row Level Security (RLS)
- ✅ Encrypted API communications
- ✅ No sensitive data in logs
- ✅ Regular dependency updates
- ✅ GDPR compliant

---

## 📚 Documentation

- 📖 [Setup Guide](./docs/SETUP_GUIDE.md)
- 🧪 [Testing Guide](./docs/TESTING_GUIDE.md)
- 📋 [Project Summary](./docs/PROJECT_SUMMARY.md)
- 📊 [Statistics](./docs/REAL_STATS.md)

---

## 🚀 Roadmap

- [ ] AI letter improvement suggestions
- [ ] Multi-language support
- [ ] LinkedIn profile integration
- [ ] Interview preparation guide
- [ ] Salary negotiation templates
- [ ] Mobile app (React Native)
- [ ] Browser extension

---

## 🐛 Known Issues & Limitations

- Protected routes require Supabase authentication
- AI generation requires valid API credentials
- Payment flows need real Lemon Squeezy setup
- Some features marked as "coming soon" in UI

---

## ⭐ Support & Feedback

- 💬 **Issues:** [GitHub Issues](https://github.com/hamadalikhan8770/visaletter-ai/issues)
- 💡 **Feature Requests:** [Discussions](https://github.com/hamadalikhan8770/visaletter-ai/discussions)
- 📧 **Email:** [Hamadalikhan8770@gmail.com](mailto:Hamadalikhan8770@gmail.com)
- 🔗 **LinkedIn:** [linkedin.com/in/hamadalikhan](https://linkedin.com/in/hamadalikhan)

---

## 📜 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

<div align="center">

**Help international professionals land their dream jobs globally! 🌍**

[⭐ Star on GitHub](https://github.com/hamadalikhan8770/visaletter-ai) | [🚀 Try Live Demo](https://visaletter-ai.vercel.app)

Built with ❤️ by [Hamad Ali Khan](https://github.com/hamadalikhan8770)

</div>
