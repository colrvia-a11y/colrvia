import React from 'react'
import Link from 'next/link'
// Removed recommendations & stories logic
import nextDynamic from 'next/dynamic'
const AccountIcon = nextDynamic(()=> import('@/components/nav/AccountIcon'), { ssr:false })

export const dynamic = 'force-dynamic'

export default function Home(){
  return (
    <div className="relative pb-32">
      <div className="absolute right-4 top-4 z-30"><AccountIcon /></div>
      <section className="pt-24 px-4 mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.25em] font-medium text-[var(--ink-subtle)] uppercase">instant color confidence</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight">from vibe to walls in minutes.</h1>
        <p className="mt-4 text-lg text-[var(--ink-subtle)] max-w-md">real paint codes. clear placements. confidence now.</p>
        <div className="mt-8">
          <Link href="/designers" className="inline-flex items-center rounded-2xl bg-[var(--brand)] px-6 py-3 text-white text-sm font-medium shadow-soft hover:bg-[var(--brand-hover)] transition-colors">Start Color Story</Link>
        </div>
      </section>
    </div>
  )
}