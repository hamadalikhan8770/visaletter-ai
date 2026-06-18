'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { downloadTextAsPDF, formatDate } from '@/lib/utils'
import { type Generation, type Subscription } from '@/types'

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function loadHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [genRes, subRes] = await Promise.all([
        supabase
          .from('generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
      ])

      setGenerations(genRes.data ?? [])
      setSubscription(subRes.data)
      setLoading(false)
    }
    loadHistory()
  }, [supabase])

  async function handleCopy(gen: Generation) {
    await navigator.clipboard.writeText(gen.output_text)
    setCopiedId(gen.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleDownload(gen: Generation) {
    const role = gen.current_role?.replace(/\s+/g, '-').toLowerCase() ?? 'cover-letter'
    downloadTextAsPDF(gen.output_text, `${role}-${gen.target_country ?? 'letter'}.pdf`)
  }

  const canDownloadPDF = subscription?.plan !== 'free'

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-xl mb-4 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-1">Cover Letter History</h1>
          <p className="text-slate-500 text-sm">
            {generations.length} letter{generations.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Link href="/generate">
          <Button>+ New Letter</Button>
        </Link>
      </div>

      {generations.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">No letters yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Your generated cover letters will appear here once you create them.
          </p>
          <Link href="/generate">
            <Button>Generate my first letter</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {generations.map((gen) => {
            const isExpanded = expandedId === gen.id
            return (
              <Card key={gen.id} className="transition-all">
                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : gen.id)}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">
                        {gen.current_role ?? 'Cover Letter'}
                      </span>
                      {gen.target_country && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          → {gen.target_country}
                        </span>
                      )}
                      <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                        {gen.tone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(gen.created_at)}</p>
                    {!isExpanded && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {gen.output_text.slice(0, 180)}...
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : gen.id)}
                      className="text-slate-400"
                    >
                      {isExpanded ? '▲ Hide' : '▼ Show'}
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="prose-letter bg-slate-50 rounded-xl p-5 mb-4 text-sm">
                      {gen.output_text.split('\n').map((p, i) =>
                        p.trim() ? (
                          <p key={i} className="mb-3 last:mb-0 text-slate-700 leading-relaxed">
                            {p}
                          </p>
                        ) : (
                          <br key={i} />
                        )
                      )}
                    </div>

                    {/* Job description snippet */}
                    {gen.job_description && (
                      <details className="mb-4">
                        <summary className="text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700">
                          View original job description
                        </summary>
                        <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 leading-relaxed max-h-32 overflow-y-auto">
                          {gen.job_description}
                        </div>
                      </details>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleCopy(gen)}>
                        {copiedId === gen.id ? '✓ Copied!' : '📋 Copy'}
                      </Button>
                      {canDownloadPDF ? (
                        <Button size="sm" onClick={() => handleDownload(gen)}>
                          ⬇ Download PDF
                        </Button>
                      ) : (
                        <Link href="/pricing">
                          <Button size="sm" variant="secondary">
                            🔒 PDF (upgrade)
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {!canDownloadPDF && generations.length > 0 && (
        <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex items-center gap-3">
          <span className="text-xl">⬇️</span>
          <div>
            <strong>Want PDF downloads?</strong> Upgrade to Basic or Pro to download all your letters as PDFs.{' '}
            <Link href="/pricing" className="font-semibold underline">
              View plans →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
