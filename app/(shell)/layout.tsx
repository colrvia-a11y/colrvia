"use client"
import React from 'react'
import RouteTransition from '@/components/ux/RouteTransition'
import BottomNav from '@/components/nav/BottomNav'

export default function ShellLayout({ children }: { children: React.ReactNode }){
  return (
    <div className="min-h-screen pb-24">
      <RouteTransition>{children}</RouteTransition>
      <BottomNav />
    </div>
  )
}
