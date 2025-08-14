"use client"
import React from 'react'
import RouteTransition from '@/components/ux/RouteTransition'
import BottomNav from '@/components/nav/BottomNav'
import { usePathname } from 'next/navigation'

export default function ShellLayout({ children }: { children: React.ReactNode }){
  const pathname = usePathname() || '/'
  const hideBottomNav = pathname.startsWith('/start')
  return (
    <div className="min-h-screen pb-24">
      <RouteTransition>{children}</RouteTransition>
      {!hideBottomNav && <BottomNav />}
    </div>
  )
}
