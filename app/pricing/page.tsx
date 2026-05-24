'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

const plans = [
  {
    name: 'Free',
    plan: 'free' as const,
    price: '$0',
    period: '/month',
    desc: 'Try it before you commit to anything',
    features: [
      '3 cover letters per month',
      'Copy to clipboard',
      'All countries (UK, Canada, Australia)',
      'Standard generation speed',
    ],
    notIncluded: ['PDF download', 'Saved history', 'Tone selector'],
    cta: 'Get started free',
    variant: 'secondary' as const,
    popular: false,
  },
  {
    name: 'Basic',
    plan: 'basic' as const,
    price: '$9',
    period: '/month',
    desc: 'For active job seekers applying to multiple roles',
    features: [
      '20 cover letters per month',
      'PDF + Word download',
      'Saved generation history',
      'Tone selector (formal / confident / concise)',
      'Profile saved — fill once, reuse forever',
      'No watermark',
      'Email support',
    ],
    notIncluded: ['Multiple saved profiles', 'LinkedIn summary generator'],
    cta: 'Start Basic',
    variant: 'primary' as const,
    popular: true,
  },
  {
    name: 'Pro',
    plan: 'pro' as const,
    price: '$19',
    period: '/month',
    desc: 'Unlimited access for serious applicants',
    features: [
      'Unlimited cover letters',
      'All Basic features',
      'Multiple saved profiles',
      'LinkedIn summary generator',
      'Priority AI processing',
      'Priority support',
      'Early access to new features',
    ],
    notIncluded: [],
    cta: 'Start Pro',
    variant: 'secondary' as const,
    popular: false,
  },
]

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleUpgrade(plan: 'basic' | 'pro') {
    setError('')
    setLoadingPlan(plan)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/signup?plan=${plan}`)
      return
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to start checkout. Please try again.')
        return
      }

      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="py-20 px-4 sm:px-6 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-lg text-slate-600">
            Start free. Upgrade when you see the results.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid sm:grid-cols-3 gap-6 mb-14">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border-2 flex flex-col ${
                plan.popular
                  ? 'border-blue-600 shadow-xl'
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </div>
              )}
              <div className="p-7 flex-1">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                  {plan.name}
                </div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 pb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6 pb-6 border-b border-slate-100">
                  {plan.desc}
                </p>

                <div className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                      {f}
                    </div>
                  ))}
                  {plan.notIncluded.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className="mt-0.5 shrink-0">✗</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-7 pb-7">
                {plan.plan === 'free' ? (
                  <Link href="/signup">
                    <Button variant="secondary" className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                    loading={loadingPlan === plan.plan}
                    onClick={() => handleUpgrade(plan.plan as 'basic' | 'pro')}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">Pricing FAQ</h2>
          <div className="space-y-1">
            {[
              {
                q: 'Can I cancel anytime?',
                a: 'Yes. Cancel from your dashboard. Your access continues until the end of the billing period.',
              },
              {
                q: 'What happens when I hit my generation limit?',
                a: 'You will see a message and a link to upgrade. Your existing letters are never deleted.',
              },
              {
                q: 'Do limits reset every month?',
                a: 'Yes. Your generation count resets at the start of each billing cycle.',
              },
              {
                q: 'Is there a money-back guarantee?',
                a: 'Yes. If you are not satisfied within 7 days of your first paid payment, email us for a full refund.',
              },
            ].map((item) => (
              <details key={item.q} className="group border border-slate-200 rounded-lg bg-white">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-slate-900 hover:bg-slate-50 rounded-lg list-none">
                  {item.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform text-lg">⌄</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
