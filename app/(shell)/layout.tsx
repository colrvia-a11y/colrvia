import React from 'react'
import dynamic from 'next/dynamic'
import RouteTransition from '@/components/ux/RouteTransition'
const BottomNav = dynamic(()=> import('@/components/nav/BottomNav'), { ssr:false })

export default function ShellLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen pb-24">
      <RouteTransition>{children}</RouteTransition>
      <BottomNav />
    </div>
  )
}
