"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { Home, PlusCircle, FolderOpen, User, Menu } from 'lucide-react'

interface NavItem { href:string; label:string; icon:any }
const tabs:NavItem[] = [
  { href:'/', label:'Home', icon:Home },
  { href:'/start', label:'New', icon:PlusCircle },
  { href:'/dashboard', label:'Stories', icon:FolderOpen },
  { href:'/account', label:'Account', icon:User },
]

export default function AppShell({ children }: { children:React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen,setMenuOpen]=useState(false)
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-[100] bg-white text-sm px-3 py-2 rounded shadow">Skip to content</a>
      <header className="bg-[var(--bg-canvas)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(247,245,239,0.85)]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display tracking-tight text-lg">COLRVIA</Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" aria-label="Primary">
            <Link href="/start" className="hover:underline">Start</Link>
            <Link href="/dashboard" className="hover:underline">My Stories</Link>
            <Link href="/designers" className="hover:underline">Designers</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button aria-label="Menu" className="md:hidden btn btn-secondary" onClick={()=>setMenuOpen(o=>!o)}><Menu size={18} /></button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 animate-fadeIn" aria-label="Mobile menu">
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/start" className="py-2">Start</Link>
              <Link href="/dashboard" className="py-2">My Stories</Link>
              <Link href="/designers" className="py-2">Designers</Link>
              <Link href="/account" className="py-2">Account</Link>
            </div>
          </div>
        )}
      </header>
      <main id="main" className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-[var(--border)] bg-[var(--bg-canvas)]">
        <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-[var(--ink-subtle)] flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Colrvia</p>
          <div className="flex gap-5">
            <Link href="/start" className="hover:underline">Start</Link>
            <Link href="/dashboard" className="hover:underline">Stories</Link>
            <Link href="/designers" className="hover:underline">Designers</Link>
          </div>
        </div>
      </footer>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[color:rgba(247,245,239,0.9)] backdrop-blur" aria-label="App tabs">
        <ul className="flex justify-around py-2">
          {tabs.map(t=>{
            const active = pathname === t.href
            const Icon = t.icon
            return (
              <li key={t.href}>
                <Link href={t.href} className="flex flex-col items-center text-[11px] font-medium relative px-2 py-1 focus:outline-none focus-visible:underline">
                  <Icon size={20} className="mb-0.5" />
                  {t.label}
                  {active && <span aria-hidden className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />}
                  <span className="sr-only">{active? '(Current)': ''}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
