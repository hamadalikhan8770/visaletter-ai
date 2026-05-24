import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { getPlanBadgeColor, getGenerationsRemaining, formatDate, truncateText } from '@/lib/utils'
import { PLAN_LIMITS, type Profile, type Subscription, type Generation } from '@/types'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile, subscription, recent generations in parallel
  const [profileResult, subscriptionResult, generationsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase
      .from('generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const profile = profileResult.data as Profile | null
  const subscription = subscriptionResult.data as Subscription | null
  const recentGenerations = (generationsResult.data as Generation[]) ?? []

  const plan = subscription?.plan ?? 'free'
  const generationsRemaining = subscription
    ? getGenerationsRemaining(subscription)
    : PLAN_LIMITS.free
  const limit = PLAN_LIMITS[plan]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Success banner after upgrade */}
      {searchParams.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium flex items-center gap-2">
          <span>🎉</span>
          <span>Your plan has been upgraded successfully! Enjoy your new limits.</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{user.email}</p>
        </div>
        <Link href="/generate">
          <Button size="lg">
            + New Cover Letter
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Plan */}
        <Card>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current Plan</div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-black capitalize ${
                plan === 'pro' ? 'text-purple-700' : plan === 'basic' ? 'text-blue-700' : 'text-slate-700'
              }`}
            >
              {plan}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getPlanBadgeColor(plan)}`}>
              {plan.toUpperCase()}
            </span>
          </div>
          {plan === 'free' && (
            <Link href="/pricing" className="text-xs text-blue-600 font-medium mt-2 block hover:underline">
              Upgrade for more →
            </Link>
          )}
        </Card>

        {/* Generations remaining */}
        <Card>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Generations This Month
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-black text-slate-900">
              {limit === -1 ? '∞' : generationsRemaining}
            </span>
            {limit !== -1 && (
              <span className="text-slate-400 text-sm mb-0.5">/ {limit} remaining</span>
            )}
          </div>
          {limit !== -1 && (
            <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  generationsRemaining === 0 ? 'bg-red-400' : 'bg-blue-500'
                }`}
                style={{
                  width: `${Math.max(0, ((limit - (subscription?.generations_used ?? 0)) / limit) * 100)}%`,
                }}
              />
            </div>
          )}
        </Card>

        {/* Total generated */}
        <Card>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Total Letters Generated
          </div>
          <div className="text-2xl font-black text-slate-900">
            {subscription?.generations_used ?? 0}
          </div>
          <p className="text-xs text-slate-400 mt-1">this billing period</p>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/generate" className="group">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                ✍️
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Generate Cover Letter
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Paste a job description and get a professional letter in 60 seconds.
                </p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/history" className="group">
          <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                📂
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  View History
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Access all your previous cover letters and download them again.
                </p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent generations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Recent Letters</h2>
          {recentGenerations.length > 0 && (
            <Link href="/history" className="text-sm text-blue-600 hover:underline font-medium">
              View all →
            </Link>
          )}
        </div>

        {recentGenerations.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-semibold text-slate-700 mb-2">No letters yet</h3>
            <p className="text-sm text-slate-500 mb-5">
              Generate your first cover letter to get started.
            </p>
            <Link href="/generate">
              <Button>Generate my first letter</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentGenerations.map((gen) => (
              <Card key={gen.id} padding="sm" className="hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {gen.current_role ?? 'Cover Letter'} → {gen.target_country ?? 'International'}
                      </span>
                      <span className="shrink-0 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full capitalize">
                        {gen.tone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">{formatDate(gen.created_at)}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {truncateText(gen.output_text, 160)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade CTA for free users */}
      {plan === 'free' && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Need more letters?</h3>
              <p className="text-blue-100 text-sm">
                Upgrade to Basic for 20 letters/month, PDF downloads, and saved history — for just $9/month.
              </p>
            </div>
            <Link href="/pricing" className="shrink-0">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 whitespace-nowrap">
                Upgrade to Basic →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
