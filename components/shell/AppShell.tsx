"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui'
import { Menu, User } from 'lucide-react'
import TabBar from '@/components/nav/TabBar'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AppShell({ children }: { children:React.ReactNode }) {
  const [menuOpen,setMenuOpen]=useState(false)
  const [user,setUser]=useState<any>(null)
  const [checking,setChecking]=useState(true)

  useEffect(()=>{
    let mounted = true
    const supabase = supabaseBrowser()
    supabase.auth.getUser().then(({ data:{ user } })=> { if(mounted){ setUser(user); setChecking(false) } })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (evt, session)=> {
      if(mounted) setUser(session?.user ?? null)
      try {
        if (evt === 'SIGNED_OUT') {
          await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_OUT' }) })
        } else if (session?.access_token && session?.refresh_token) {
          await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event: evt, access_token: session.access_token, refresh_token: session.refresh_token }) })
        }
      } catch (e) { /* swallow */ }
    })
    return ()=> { mounted=false; subscription?.unsubscribe?.() }
  },[])

  async function signOut(){
    try {
      await supabaseBrowser().auth.signOut()
      await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_OUT' }) })
    } catch {}
  }
  return (
  <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] bg-white text-sm px-3 py-2 rounded shadow">Skip to content</a>
  <header className="bg-[var(--color-bg)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display tracking-tight text-lg">COLRVIA</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
            <Link href="/designers" className="hover:underline">Designers</Link>
            {!checking && !user && <Link href="/sign-in" className="hover:underline">Sign in / Sign up</Link>}
            {user && (
              <Link
                href="/account"
                aria-label="Account"
                className="relative inline-flex rounded-full border border-white/15 bg-white/5 p-2 hover:bg-white/10 transition-colors"
              >
                <span className="absolute inset-[-6px]" aria-hidden />
                <User size={18} />
              </Link>
            )}
            {user && <button type="button" onClick={signOut} className="text-sm hover:underline">Sign out</button>}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button type="button" aria-label="Menu" className="md:hidden btn btn-secondary" onClick={()=>setMenuOpen(o=>!o)}><Menu size={18} /></button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 animate-fadeIn" aria-label="Mobile menu">
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/designers" className="py-2">Designers</Link>
              {!user && <Link href="/sign-in" className="py-2">Sign in / Sign up</Link>}
              {user && (
                <Link
                  href="/account"
                  aria-label="Account"
                  className="relative inline-flex items-center py-2 gap-2"
                >
                  <span className="absolute inset-[-6px]" aria-hidden />
                  <User size={16} />
                </Link>
              )}
              {user && <button type="button" onClick={signOut} className="py-2 text-left">Sign out</button>}
            </div>
          </div>
        )}
      </header>
      <main id="main" className="flex-1">{children}</main>
  {/* Footer: force dark mode for better subtext contrast on dark green backgrounds */}
  <footer className="mt-16 dark bg-[#2F5D50]">
    <div className="max-w-6xl mx-auto px-4 py-10 text-sm flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
  <p className="opacity-80 text-subtext-dark">© {new Date().getFullYear()} Colrvia</p>
      <div className="flex gap-5">
  <Link href="/designers" className="hover:underline text-subtext-dark">Designers</Link>
  <Link href="/dashboard" className="hover:underline text-subtext-dark">Stories</Link>
      </div>
    </div>
  </footer>
  <TabBar />
    </div>
  )
}
