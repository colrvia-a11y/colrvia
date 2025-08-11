"use client"
import Link from 'next/link'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-paper/70 bg-paper/90 border-b border-linen">
        <div className="max-w-content container flex items-center justify-between py-3">
          <Link href="/" className="font-display text-2xl">Colrvia</Link>
          <nav className="flex gap-3">
            <Link className="text-sm text-ink-subtle hocus:underline" href="/designers">Start</Link>
            <Link className="text-sm text-ink-subtle hocus:underline" href="/dashboard">My Stories</Link>
          </nav>
        </div>
      </header>
      <main className="container max-w-content py-5 md:py-8">{children}</main>
      <footer className="container max-w-content py-10 text-center text-sm text-ink-subtle">Good-enough gorgeous, fast.</footer>
    </div>
  )
}
