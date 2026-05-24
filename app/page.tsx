import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            UK · Canada · Australia
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 mb-5 leading-[1.1]">
            Get a{' '}
            <span className="text-blue-600">Visa-Ready</span>{' '}
            Cover Letter in 60 Seconds
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Built specifically for international applicants. Paste any job description and get a
            professional cover letter that handles the sponsorship angle — without scaring employers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Generate My Free Cover Letter →
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                View pricing
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-400">
            No credit card required &nbsp;·&nbsp; 3 free letters &nbsp;·&nbsp; Used by international applicants worldwide
          </p>
          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { value: '60s', label: 'To generate' },
              { value: '300+', label: 'Words, formatted' },
              { value: '3', label: 'Countries optimised' },
            ].map((stat) => (
              <div key={stat.value} className="text-center">
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
              Generic tools don&apos;t understand your situation
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Most cover letter generators were built for local applicants. They have no idea
              what visa sponsorship means — and it shows in every letter they produce.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '😟',
                title: 'Robotic, generic output',
                desc: 'Existing tools produce letters that ignore your international background and specific visa situation entirely.',
              },
              {
                icon: '🚩',
                title: 'Scares employers away',
                desc: 'A poorly worded sponsorship mention can get your application rejected before the hiring manager finishes the first sentence.',
              },
              {
                icon: '⏱️',
                title: 'Hours of rewriting',
                desc: 'You are applying to 30+ jobs. Rewriting a tailored cover letter from scratch each time is unsustainable.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-red-50 border border-red-100 rounded-xl p-6"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-red-900 mb-2">{item.title}</h3>
                <p className="text-sm text-red-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-12">
            Three steps. 60 seconds.
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Paste the job description',
                desc: 'Copy the full job post from LinkedIn, Indeed, NHS Jobs, SEEK — any site. Paste it in.',
              },
              {
                step: '2',
                title: 'Fill in your details',
                desc: 'Name, experience, skills, and visa situation. Takes about 30 seconds.',
              },
              {
                step: '3',
                title: 'Download your letter',
                desc: 'Click Generate. Edit if needed, then download as PDF or copy to clipboard.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-black flex items-center justify-center mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌍', title: 'Built for sponsored roles', desc: 'Addresses visa status professionally — confident, not apologetic.' },
              { icon: '⚡', title: 'Paste any job description', desc: 'Works with LinkedIn, Indeed, NHS Jobs, SEEK, and any job board.' },
              { icon: '📄', title: 'PDF & Word download', desc: 'Get your letter ready to attach immediately. No extra formatting.' },
              { icon: '💾', title: 'Save your profile once', desc: 'Fill your details once. Generate for different jobs in seconds.' },
              { icon: '🎯', title: 'Tailored to the job', desc: "Picks up keywords from the job post. Not a template — a real letter." },
              { icon: '🏥', title: 'Works for any industry', desc: 'Nursing, IT, engineering, finance, trades — adapts to your profession.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-slate-900 mb-1.5">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">
            Simple, honest pricing
          </h2>
          <p className="text-slate-600 mb-10">Start free. Upgrade only when you see the results.</p>
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: 'Try it before you commit',
                features: ['3 letters/month', 'Copy to clipboard', 'All countries'],
                popular: false,
              },
              {
                name: 'Basic',
                price: '$9',
                desc: 'For active job seekers',
                features: ['20 letters/month', 'PDF + Word download', 'Saved history', 'Tone selector'],
                popular: true,
              },
              {
                name: 'Pro',
                price: '$19',
                desc: 'Unlimited access',
                features: ['Unlimited letters', 'Multiple profiles', 'LinkedIn summary', 'Priority support'],
                popular: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl p-6 border-2 ${
                  plan.popular ? 'border-blue-600 shadow-lg' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className="text-sm font-bold text-slate-500 mb-1">{plan.name}</div>
                <div className="text-3xl font-black text-slate-900 mb-1">
                  {plan.price}<span className="text-base font-normal text-slate-400">/mo</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="text-green-500 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'primary' : 'secondary'}
                  >
                    Get started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="text-sm text-blue-600 hover:underline font-medium">
            See full plan details →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-black text-slate-900">Common questions</h2>
          </div>
          <div className="space-y-1">
            {[
              {
                q: 'Will employers know AI wrote this?',
                a: 'No. The output is written in your voice using your specific experience and the job description. It sounds like you — just a better-written version.',
              },
              {
                q: 'Does it work for nursing, IT, engineering, and trades?',
                a: 'Yes. The AI reads the job description and adapts its language to match your industry. It is not a one-size-fits-all template.',
              },
              {
                q: 'Which countries does it support?',
                a: 'Optimised for UK, Canada, and Australia at launch. Works for other countries too — the language adjusts based on your target country.',
              },
              {
                q: 'What if I do not like the output?',
                a: 'You can regenerate with one click or edit the letter directly on screen. Paid plans come with a 7-day money-back guarantee.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. No contracts, no cancellation fees. Cancel from your dashboard in seconds.',
              },
            ].map((item) => (
              <details key={item.q} className="group border border-slate-200 rounded-lg">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 rounded-lg transition-colors list-none">
                  {item.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-lg">⌄</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4 sm:px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Your next job could be one letter away
          </h2>
          <p className="text-blue-200 text-lg mb-8">
            Stop sending the same cover letter to 50 jobs. Write one that actually fits the role — in 60 seconds.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg">
              Generate My Free Cover Letter →
            </Button>
          </Link>
          <p className="text-blue-300 text-sm mt-4">No credit card · Free at signup · UK, Canada &amp; Australia</p>
        </div>
      </section>
    </div>
  )
}
