'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { createClient } from '@/lib/supabase/client'
import { downloadTextAsPDF, getGenerationsRemaining } from '@/lib/utils'
import { type GenerateFormData, type Subscription, type GenerateResponse, PLAN_LIMITS } from '@/types'

const INITIAL_FORM: GenerateFormData = {
  fullName: '',
  currentCountry: '',
  targetCountry: '',
  currentRole: '',
  yearsExperience: '',
  skills: '',
  education: '',
  visaStatus: '',
  tone: 'formal',
  jobDescription: '',
}

const TONE_OPTIONS = [
  { value: 'formal', label: 'Formal — Professional and structured' },
  { value: 'confident', label: 'Confident — Direct and assertive' },
  { value: 'concise', label: 'Concise — Brief and to the point' },
]

const VISA_OPTIONS = [
  { value: 'requires_sponsorship', label: 'I require employer sponsorship' },
  { value: 'has_right_to_work', label: 'I already have the right to work' },
  { value: 'student_visa', label: 'I am on a student visa' },
  { value: 'applying_for_pr', label: 'I am applying for permanent residency' },
  { value: 'not_specified', label: 'Prefer not to mention visa status' },
]

const COUNTRY_OPTIONS = [
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'United States', label: 'United States' },
  { value: 'New Zealand', label: 'New Zealand' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Other', label: 'Other' },
]

export default function GeneratePage() {
  const [form, setForm] = useState<GenerateFormData>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<GenerateFormData>>({})
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [outputId, setOutputId] = useState('')
  const [apiError, setApiError] = useState('')
  const [copied, setCopied] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      if (profileRes.data?.full_name) {
        setForm((f) => ({ ...f, fullName: profileRes.data.full_name ?? '' }))
      }
      setSubscription(subRes.data)
      setLoadingSubscription(false)
    }
    loadProfile()
  }, [supabase])

  function updateField(field: keyof GenerateFormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) {
      setErrors((e) => ({ ...e, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const newErrors: Partial<GenerateFormData> = {}
    if (!form.jobDescription.trim()) newErrors.jobDescription = 'Job description is required'
    if (!form.currentRole.trim()) newErrors.currentRole = 'Current role is required'
    if (!form.targetCountry) newErrors.targetCountry = 'Target country is required'
    if (!form.visaStatus) newErrors.visaStatus = 'Visa status is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setApiError('')
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 403 && data.upgrade) {
          setApiError('You have reached your monthly generation limit. Please upgrade your plan.')
        } else {
          setApiError(data.error ?? 'Failed to generate. Please try again.')
        }
        return
      }

      const typed = data as GenerateResponse
      setOutput(typed.outputText)
      setOutputId(typed.id)
      setSubscription((s) =>
        s ? { ...s, generations_used: typed.generationsUsed } : s
      )

      // Scroll to output
      setTimeout(() => {
        document.getElementById('output-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch {
      setApiError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadPDF() {
    const fileName = `cover-letter-${form.currentRole.replace(/\s+/g, '-').toLowerCase() || 'visaletter'}.pdf`
    downloadTextAsPDF(output, fileName)
  }

  async function handleRegenerate() {
    const event = { preventDefault: () => {} } as React.FormEvent
    setOutput('')
    await handleGenerate(event)
  }

  const canDownloadPDF = subscription?.plan !== 'free'
  const plan = subscription?.plan ?? 'free'
  const remaining = subscription ? getGenerationsRemaining(subscription) : PLAN_LIMITS.free

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">Generate Cover Letter</h1>
            <p className="text-slate-500 text-sm">
              Fill in your details and paste the job description below.
            </p>
          </div>
          {!loadingSubscription && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-500">
                {plan === 'pro' ? (
                  <span className="font-medium text-purple-600">∞ Unlimited</span>
                ) : remaining === 0 ? (
                  <span className="font-medium text-red-600">0 remaining</span>
                ) : (
                  <span className="font-medium text-blue-600">{remaining} remaining</span>
                )}
              </span>
              <Link href="/pricing" className="text-xs text-slate-400 hover:text-blue-600">
                ({plan} plan)
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Limit warning */}
      {!loadingSubscription && remaining === 0 && plan !== 'pro' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <strong>Monthly limit reached.</strong> You have used all {PLAN_LIMITS[plan]} generations this month.{' '}
            <Link href="/pricing" className="font-semibold underline">
              Upgrade your plan
            </Link>{' '}
            to continue generating letters.
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate}>
        {/* Profile section */}
        <Card className="mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-5">Your Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Priya Sharma"
            />
            <Input
              label="Current Job Title"
              value={form.currentRole}
              onChange={(e) => updateField('currentRole', e.target.value)}
              placeholder="ICU Staff Nurse"
              required
              error={errors.currentRole}
            />
            <Select
              label="Current Country"
              value={form.currentCountry}
              onChange={(e) => updateField('currentCountry', e.target.value)}
              options={COUNTRY_OPTIONS}
              placeholder="Select country..."
            />
            <Select
              label="Target Country"
              value={form.targetCountry}
              onChange={(e) => updateField('targetCountry', e.target.value)}
              options={COUNTRY_OPTIONS}
              placeholder="Select country..."
              required
              error={errors.targetCountry}
            />
            <Input
              label="Years of Experience"
              value={form.yearsExperience}
              onChange={(e) => updateField('yearsExperience', e.target.value)}
              placeholder="6 years"
            />
            <Input
              label="Education"
              value={form.education}
              onChange={(e) => updateField('education', e.target.value)}
              placeholder="BSc Nursing"
            />
            <div className="sm:col-span-2">
              <Input
                label="Top 3 Skills"
                value={form.skills}
                onChange={(e) => updateField('skills', e.target.value)}
                placeholder="ICU patient care, medication administration, team leadership"
                hint="Comma-separated"
              />
            </div>
            <Select
              label="Visa Status"
              value={form.visaStatus}
              onChange={(e) => updateField('visaStatus', e.target.value)}
              options={VISA_OPTIONS}
              placeholder="Select visa status..."
              required
              error={errors.visaStatus}
            />
            <Select
              label="Preferred Tone"
              value={form.tone}
              onChange={(e) => updateField('tone', e.target.value as GenerateFormData['tone'])}
              options={TONE_OPTIONS}
            />
          </div>
        </Card>

        {/* Job description */}
        <Card className="mb-6">
          <h2 className="text-base font-bold text-slate-900 mb-2">Job Description</h2>
          <p className="text-sm text-slate-500 mb-4">
            Paste the full job post from any job board. The AI reads it to tailor your letter.
          </p>
          <Textarea
            value={form.jobDescription}
            onChange={(e) => updateField('jobDescription', e.target.value)}
            placeholder="Paste the complete job description here..."
            rows={10}
            required
            error={errors.jobDescription}
          />
        </Card>

        {apiError && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
            <span>❌</span>
            <span>
              {apiError}{' '}
              {apiError.includes('limit') && (
                <Link href="/pricing" className="font-semibold underline">
                  View upgrade options
                </Link>
              )}
            </span>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          loading={loading}
          disabled={remaining === 0 && plan !== 'pro'}
        >
          {loading ? 'Generating your letter...' : '✨ Generate Cover Letter'}
        </Button>
      </form>

      {/* Output */}
      {output && (
        <div id="output-section" className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Your Cover Letter</h2>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleRegenerate} disabled={loading}>
                🔄 Regenerate
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </Button>
              {canDownloadPDF ? (
                <Button size="sm" onClick={handleDownloadPDF}>
                  ⬇ Download PDF
                </Button>
              ) : (
                <Link href="/pricing">
                  <Button size="sm" variant="secondary" title="PDF download requires Basic or Pro plan">
                    🔒 PDF (upgrade)
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Card className="bg-white">
            <div className="prose-letter">
              {output.split('\n').map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ) : (
                  <br key={i} />
                )
              )}
            </div>
          </Card>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : '📋 Copy to clipboard'}
            </Button>
            {canDownloadPDF ? (
              <Button size="sm" onClick={handleDownloadPDF}>
                ⬇ Download as PDF
              </Button>
            ) : (
              <Link href="/pricing">
                <Button size="sm" variant="secondary">
                  🔒 Upgrade to download PDF
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={loading}>
              Try a different version
            </Button>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Letter saved to your history.{' '}
            <Link href="/history" className="hover:underline text-blue-500">
              View all letters →
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
