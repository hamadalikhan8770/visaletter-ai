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
    <nav className="sticky top-0 z-50 bg-[#0A0A14]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight">
              <span className="text-indigo-400">Visa</span>
              <span className="text-white">Letter</span>
              <span className="text-indigo-400">.ai</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/generate" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                      Generate
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                    <Link
                      href="/generate"
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 cursor-pointer"
                    >
                      New Letter
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150 cursor-pointer"
                    >
                      Get started free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:bg-white/10 transition-colors cursor-pointer"
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
          <div className="sm:hidden py-3 border-t border-white/10 space-y-1">
            <Link href="/pricing" className="block px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
              Pricing
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  Dashboard
                </Link>
                <Link href="/generate" className="block px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  Generate
                </Link>
                <Link href="/history" className="block px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  History
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="block px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors">
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
