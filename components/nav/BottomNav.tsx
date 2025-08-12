"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, Grid3x3 } from 'lucide-react'

const TABS = [
  { href: '/home', label: 'Home', Icon: Home },
  { href: '/stories', label: 'Stories', Icon: Heart },
  { href: '/more', label: 'More', Icon: Grid3x3 }
] as const

export function BottomNav(){
  const pathname = usePathname() || '/'
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 bg-[var(--color-bg)] backdrop-blur">
      <div className="mx-auto max-w-3xl">
        <ul className="grid grid-cols-3 gap-1 px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {TABS.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/home' && pathname.startsWith(href))
            return (
              <li key={href} className="flex justify-center">
                <div className={["w-full max-w-[160px] rounded-2xl px-2 py-1.5 text-center", active? 'bg-white/10':'hover:bg-white/5'].join(' ')}>
                  <Link href={href} aria-current={active? 'page': undefined} className="flex flex-col items-center gap-0.5">
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] leading-none">{label}</span>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default BottomNav
