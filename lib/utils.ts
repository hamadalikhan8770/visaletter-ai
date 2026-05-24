import { Plan, PLAN_LIMITS, Subscription } from '@/types'

export function getGenerationsRemaining(subscription: Subscription): number {
  const limit = PLAN_LIMITS[subscription.plan]
  if (limit === -1) return Infinity
  return Math.max(0, limit - subscription.generations_used)
}

export function canGenerate(subscription: Subscription): boolean {
  const limit = PLAN_LIMITS[subscription.plan]
  if (limit === -1) return true
  return subscription.generations_used < limit
}

export function isPeriodExpired(subscription: Subscription): boolean {
  return new Date() > new Date(subscription.current_period_end)
}

export function getPlanBadgeColor(plan: Plan): string {
  switch (plan) {
    case 'free': return 'bg-slate-100 text-slate-700'
    case 'basic': return 'bg-blue-100 text-blue-700'
    case 'pro': return 'bg-purple-100 text-purple-700'
  }
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function downloadTextAsPDF(text: string, filename: string) {
  // Dynamically import jsPDF to avoid SSR issues
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const maxWidth = pageWidth - margin * 2
    const lineHeight = 7
    let y = 30

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)

    const lines = doc.splitTextToSize(text, maxWidth)

    lines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += lineHeight
    })

    doc.save(filename)
  })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
