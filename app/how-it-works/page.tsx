import React from 'react'
import HowItWorksContent from '@/components/marketing/HowItWorksContent'
import { HowItWorksOpenTrack } from '@/components/marketing/HowItWorksOpenTrack'
import { track } from '@/lib/analytics'

export const dynamic = 'force-dynamic'

export default function HowItWorksPage(){
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
  <HowItWorksOpenTrack />
      <header className="mb-6">
  <p className="text-xs uppercase tracking-wide text-muted-foreground">instant color confidence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">How it works</h1>
  <p className="mt-2 text-muted-foreground">Three quick steps from vibe to walls.</p>
      </header>
      <HowItWorksContent />
    </main>
  )
}
