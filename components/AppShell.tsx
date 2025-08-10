'use client'
import Link from 'next/link'
import MagneticHover from '@/components/motion/MagneticHover'
import Button from '@/components/ui/Button'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white border-b">
        <div className="container-xy h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-wider">COLRVIA</Link>
          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/designers" className="hover:underline">Designers</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <Link href="/sign-in" className="hover:underline">Sign in</Link>
          </nav>
          <MagneticHover><Button as={Link} href="/designers">Get started</Button></MagneticHover>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-20 border-t">
        <div className="container-xy py-8 text-sm text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Colrvia</span>
          <div className="flex gap-4">
            <Link href="/designers" className="hover:underline">Start</Link>
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
