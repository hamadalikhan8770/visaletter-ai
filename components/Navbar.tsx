'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-blue-600">Visa</span>
              <span className="text-slate-900">Letter</span>
              <span className="text-blue-600">.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/generate" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                      Generate
                    </Link>
                    <Button variant="ghost" size="sm" onClick={handleSignOut}>
                      Sign out
                    </Button>
                    <Link href="/generate">
                      <Button size="sm">New Letter</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="secondary" size="sm">Log in</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Get started free</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden py-3 border-t border-slate-100 space-y-1">
            <Link href="/pricing" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
              Pricing
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Dashboard
                </Link>
                <Link href="/generate" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Generate
                </Link>
                <Link href="/history" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  History
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
                  Log in
                </Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                  Get started free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
