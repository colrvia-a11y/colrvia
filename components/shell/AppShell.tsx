"use client"
import Link from 'next/link'
import { useState, useEffect } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Menu } from 'lucide-react'
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
      <header className="bg-[var(--bg-canvas)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(247,245,239,0.85)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display tracking-tight text-lg">COLRVIA</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
            <Link href="/designers" className="hover:underline">Start</Link>
            {user && <Link href="/dashboard" className="hover:underline">My Stories</Link>}
            <Link href="/designers" className="hover:underline">Designers</Link>
            {!checking && !user && <Link href="/sign-in" className="hover:underline">Sign in / Sign up</Link>}
            {user && <Link href="/account" className="hover:underline">Account</Link>}
            {user && <button onClick={signOut} className="text-sm hover:underline" aria-label="Sign out">Sign out</button>}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button aria-label="Menu" className="md:hidden btn btn-secondary" onClick={()=>setMenuOpen(o=>!o)}><Menu size={18} /></button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 animate-fadeIn" aria-label="Mobile menu">
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/designers" className="py-2">Start</Link>
              {user && <Link href="/dashboard" className="py-2">My Stories</Link>}
              <Link href="/designers" className="py-2">Designers</Link>
              {!user && <Link href="/sign-in" className="py-2">Sign in / Sign up</Link>}
              {user && <Link href="/account" className="py-2">Account</Link>}
              {user && <button onClick={signOut} className="py-2 text-left">Sign out</button>}
            </div>
          </div>
        )}
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-canvas)]">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-[var(--ink-subtle)] flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Colrvia</p>
          <div className="flex gap-5">
            <Link href="/designers" className="hover:underline">Start</Link>
            <Link href="/dashboard" className="hover:underline">Stories</Link>
            <Link href="/designers" className="hover:underline">Designers</Link>
          </div>
        </div>
      </footer>
  <TabBar />
    </div>
  )
}
