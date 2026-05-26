import Link from 'next/link'

// ─── SVG Icon Components (Heroicons style, no emojis) ─────────────────────────

function IconGlobe({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function IconBolt({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  )
}

function IconDocument({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function IconBookmark({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )
}

function IconTarget({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  )
}

function IconBriefcase({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}

function IconCheck({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function IconStar({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function IconXMark({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function IconArrowRight({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: IconGlobe,
    title: 'Built for sponsored roles',
    desc: 'Addresses visa status professionally — confident, not apologetic. Mentions sponsorship only when needed.',
  },
  {
    icon: IconBolt,
    title: 'Paste any job description',
    desc: 'Works with LinkedIn, Indeed, NHS Jobs, SEEK, and any job board. One paste — fully tailored output.',
  },
  {
    icon: IconDocument,
    title: 'PDF & clipboard ready',
    desc: 'Get your letter formatted and ready to attach or paste immediately. No extra steps required.',
  },
  {
    icon: IconBookmark,
    title: 'Save your profile once',
    desc: 'Fill your details once and generate for different jobs in seconds. Your data stays private.',
  },
  {
    icon: IconTarget,
    title: 'Tailored to the job',
    desc: "Picks up keywords and requirements from the job post. Not a template — a real, targeted letter.",
  },
  {
    icon: IconBriefcase,
    title: 'Works for any industry',
    desc: 'Nursing, IT, engineering, finance, hospitality, trades — the AI adapts to your profession.',
  },
]

const testimonials = [
  {
    initial: 'A',
    name: 'Aisha Mensah',
    role: 'Registered Nurse',
    origin: 'Ghana → UK',
    rating: 5,
    quote:
      'I was spending 2 hours per cover letter, dreading the sponsorship part. This tool nailed it — confident, professional, and it got me 3 interviews in my first week.',
  },
  {
    initial: 'R',
    name: 'Raj Patel',
    role: 'Software Engineer',
    origin: 'India → Canada',
    rating: 5,
    quote:
      'Applied to 25 jobs in one week using VisaLetter. The letters actually sound like me — not some robot. Already had an offer in under 3 weeks.',
  },
  {
    initial: 'S',
    name: 'Sofia Carvalho',
    role: 'Civil Engineer',
    origin: 'Brazil → Australia',
    rating: 5,
    quote:
      'The sponsorship phrasing was always my weak point. This gets it exactly right — mentions it when appropriate, skips it when the job already sponsors.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Try it before you commit',
    features: ['3 letters / month', 'Copy to clipboard', 'UK, Canada & Australia', 'All visa statuses'],
    popular: false,
    cta: 'Start for free',
    href: '/signup',
  },
  {
    name: 'Basic',
    price: '$9',
    desc: 'For active job seekers',
    features: ['20 letters / month', 'PDF & clipboard download', 'Letter history', 'Tone selector', 'Email support'],
    popular: true,
    cta: 'Get Basic',
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$19',
    desc: 'Unlimited access',
    features: [
      'Unlimited letters',
      'Multiple profiles',
      'LinkedIn summary generator',
      'Priority support',
      'Early access to features',
    ],
    popular: false,
    cta: 'Get Pro',
    href: '/signup',
  },
]

const faqs = [
  {
    q: 'Will employers know AI wrote this?',
    a: 'No. The output uses your specific experience, skills, and the job description. It sounds like you — just a sharper, more concise version of you.',
  },
  {
    q: 'Does it work for nursing, IT, engineering, and trades?',
    a: 'Yes. The AI reads the job description and adapts its language to match your industry. It is not a one-size-fits-all template.',
  },
  {
    q: 'Which countries does it support?',
    a: 'Optimised for UK, Canada, and Australia at launch. It also works for other countries — the language adjusts based on your target country.',
  },
  {
    q: 'What if I do not like the output?',
    a: 'Regenerate with one click or edit the letter directly on screen. Paid plans include a 7-day money-back guarantee if you are not satisfied.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard in seconds.',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="bg-[#0A0A14]">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-28 px-4 sm:px-6">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[700px] w-[700px] rounded-full bg-indigo-600/20 blur-[130px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Country badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            UK · Canada · Australia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Get a{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Visa-Ready
            </span>{' '}
            Cover Letter in 60 Seconds
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Built specifically for international applicants. Paste any job description and get a
            professional cover letter that handles the sponsorship angle — without scaring employers.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/20 text-base"
            >
              Generate My Free Cover Letter
              <IconArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer text-base"
            >
              View Pricing
            </Link>
          </div>

          <p className="text-sm text-slate-500">
            No credit card required &nbsp;·&nbsp; 3 free letters &nbsp;·&nbsp; 60-second generation
          </p>

          {/* Stats */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              { value: '60s', label: 'To generate' },
              { value: '300+', label: 'Words, formatted' },
              { value: '40+', label: 'Countries of applicants' },
            ].map((stat) => (
              <div key={stat.value} className="flex flex-col items-center px-10 py-4">
                <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
          <span className="font-medium text-slate-500">Works with job posts from</span>
          {['LinkedIn', 'Indeed', 'NHS Jobs', 'SEEK', 'Glassdoor', 'Seek.com.au'].map((board) => (
            <span key={board} className="font-semibold text-slate-400">{board}</span>
          ))}
        </div>
      </div>

      {/* ── PROBLEM ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Generic tools don&apos;t understand your situation
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Most cover letter generators were built for local applicants.
              They have no idea what visa sponsorship means — and it shows.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                title: 'Robotic, generic output',
                desc: 'Existing tools produce letters that ignore your international background and specific visa situation entirely.',
              },
              {
                title: 'Scares employers away',
                desc: 'A poorly worded sponsorship mention can get your application rejected before the hiring manager finishes the first paragraph.',
              },
              {
                title: 'Hours of rewriting',
                desc: 'You are applying to 30+ jobs. Rewriting a tailored cover letter from scratch each time is unsustainable.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4">
                  <IconXMark className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-rose-200/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0F0F1C]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-16">
            Three steps. 60 seconds.
          </h2>
          <div className="grid sm:grid-cols-3 gap-10 relative">
            {[
              {
                step: '01',
                title: 'Paste the job description',
                desc: 'Copy the full job post from LinkedIn, Indeed, NHS Jobs, SEEK — any site. Paste it in the box.',
              },
              {
                step: '02',
                title: 'Fill in your details',
                desc: 'Name, experience, skills, and visa situation. Takes about 30 seconds to complete.',
              },
              {
                step: '03',
                title: 'Copy or download',
                desc: 'Click Generate. Edit if needed, then copy to clipboard or download as PDF instantly.',
              },
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-7 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
                )}
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-lg font-extrabold flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/10">
                  {item.step}
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-14">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              Try it free — no card needed
              <IconArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0A0A14]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 cursor-default"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors duration-200">
                  <Icon className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0F0F1C]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Social Proof</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
              Real results from real applicants
            </h2>
            <p className="text-slate-400">International job seekers landing interviews across the globe.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <IconStar key={i} className="w-4 h-4 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-bold shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role} · {t.origin}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0A0A14]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Simple, honest pricing
          </h2>
          <p className="text-slate-400 mb-12">Start free. Upgrade only when you see the results.</p>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-px ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-500 to-violet-600'
                    : 'bg-white/10'
                }`}
              >
                <div className={`relative rounded-2xl p-6 h-full text-left ${
                  plan.popular ? 'bg-[#11112A]' : 'bg-[#0F0F1C]'
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  <div className="text-sm font-semibold text-slate-400 mb-1">{plan.name}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-slate-500 mb-1.5">/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-5 pb-5 border-b border-white/10">{plan.desc}</p>
                  <ul className="space-y-3 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <span className="text-emerald-400 shrink-0">
                          <IconCheck className="w-4 h-4" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/pricing"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium cursor-pointer"
          >
            See full plan comparison →
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 bg-[#0F0F1C]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-extrabold text-white">Common questions</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-white hover:bg-white/5 transition-colors list-none gap-4">
                  <span>{item.q}</span>
                  <svg
                    className="w-5 h-5 text-slate-500 shrink-0 group-open:rotate-180 transition-transform duration-200"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/10 pt-4">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-4 sm:px-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-transparent" />
          <div className="absolute inset-0 bg-[#0A0A14]/50" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your next job could be one letter away
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Stop sending the same cover letter to 50 jobs. Write one that actually fits the
            role — in 60 seconds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 cursor-pointer shadow-xl shadow-emerald-500/20 text-lg"
          >
            Generate My Free Cover Letter
            <IconArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-500 text-sm mt-5">
            No credit card &nbsp;·&nbsp; Free at signup &nbsp;·&nbsp; UK, Canada &amp; Australia
          </p>
        </div>
      </section>

    </div>
  )
}
