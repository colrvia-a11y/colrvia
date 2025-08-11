"use client"
import React, { useState } from 'react'
import Link from 'next/link'
// Removed recommendations & stories logic
import nextDynamic from 'next/dynamic'
const AccountIcon = nextDynamic(()=> import('@/components/nav/AccountIcon'), { ssr:false })
const HowItWorksModal = nextDynamic(()=> import('@/components/marketing/HowItWorksModal'), { ssr:false })

export const dynamic = 'force-dynamic'

import { useStartStory } from '@/components/ux/StartStoryPortal'

export default function Home(){
  const [open, setOpen] = useState(false)
  let startStory: (href:string)=>void = (href)=>{}
  try { startStory = useStartStory() } catch {}
  return (
    <div className="relative pb-32">
  {/* Account icon now in header */}
      <section className="pt-24 px-4 mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.25em] font-medium text-[var(--ink-subtle)] uppercase">instant color confidence</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight">from vibe to walls in minutes.</h1>
        <p className="mt-4 text-lg text-[var(--ink-subtle)] max-w-md">real paint codes. clear placements. confidence now.</p>
        <div className="mt-8">
          <Link href="/designers" onClick={(e)=>{ e.preventDefault(); startStory('/designers') }} className="inline-flex items-center rounded-2xl bg-[var(--brand)] px-6 py-3 text-white text-sm font-medium shadow-soft hover:bg-[var(--brand-hover)] transition-colors">Start Color Story</Link>
        </div>
        <div className="mt-4">
          <button type="button" className="text-sm underline underline-offset-4 text-[var(--ink-subtle)] hover:text-[var(--ink)]" onClick={()=>{ setOpen(true) }}>See how it works</button>
        </div>
      </section>
  <HowItWorksModal open={open} onOpenChange={setOpen} origin="home" />
    </div>
  )
}