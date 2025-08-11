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
    <div className="relative pb-32 bg-[#404934] text-[#F7F7F2]">
      <section className="pt-24 px-4 mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.25em] font-medium uppercase opacity-90">instant color confidence</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">from vibe to walls in minutes.</h1>
        <p className="mt-4 text-lg md:text-xl opacity-90 max-w-xl">real paint codes. clear placements.</p>
        <div className="mt-10">
          <Link href="/designers" onClick={(e)=>{ e.preventDefault(); startStory('/designers') }} className="inline-flex items-center rounded-2xl px-8 py-4 text-xl md:text-2xl font-semibold shadow-soft transition-colors w-full sm:w-auto hover:opacity-95" style={{ backgroundColor:'#f2b897', color:'#1f2937' }}>Start Color Story</Link>
        </div>
        <div className="mt-6">
          <button type="button" className="text-sm underline underline-offset-4 opacity-90 hover:opacity-100" onClick={()=>{ setOpen(true) }}>See how it works</button>
        </div>
      </section>
      <HowItWorksModal open={open} onOpenChange={setOpen} origin="home" />
    </div>
  )
}