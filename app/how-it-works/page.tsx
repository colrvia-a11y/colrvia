import React from 'react'
import HowItWorksContent from '@/components/marketing/HowItWorksContent'
import { track } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export default function HowItWorksPage(){
  if (typeof window !== 'undefined') { try { track('howitworks_open', { where: 'page' }) } catch {} }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-[var(--ink-subtle)]">instant color confidence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="mt-2 text-[var(--ink-subtle)]">Three quick steps from vibe to walls.</p>
      </header>
      <HowItWorksContent />
    </main>
  )
}
