import React from 'react'
import dynamic from 'next/dynamic'
import RouteTransition from '@/components/ux/RouteTransition'
const BottomNav = dynamic(()=> import('@/components/nav/BottomNav'), { ssr:false })
import { usePathname } from 'next/navigation'

const HIDE_NAV_PREFIXES = ['/start/preferences','/onboarding','/start/preview']

export default function ShellLayout({ children }: { children: React.ReactNode }){
  const pathname = usePathname() || '/'
  const hide = HIDE_NAV_PREFIXES.some(p=> pathname.startsWith(p))
  return (
    <div className="min-h-screen pb-24">
      <RouteTransition>{children}</RouteTransition>
      {!hide && <BottomNav />}
    </div>
  )
}
