"use client"

import { Palette, MessageSquare, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { track } from '@/lib/analytics'
import React from 'react'

export default function HowItWorksContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 items-center">
        <div className="order-2 md:order-1">
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="mt-0.5"><Palette className="h-5 w-5" /></span>
              <div>
                <p className="font-medium">Pick a designer</p>
                <p className="text-sm text-muted-foreground">Three styles. Same guardrails. Choose who you vibe with.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5"><MessageSquare className="h-5 w-5" /></span>
              <div>
                <p className="font-medium">Answer a few quick questions</p>
                <p className="text-sm text-muted-foreground">Voice or typing. The AI keeps it friendly and focused.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5"><CheckCircle className="h-5 w-5" /></span>
              <div>
                <p className="font-medium">Get real paint codes + placements</p>
                <p className="text-sm text-muted-foreground">Sherwin-Williams or Behr, 60/30/10 with trim & ceiling.</p>
              </div>
            </li>
          </ol>
          <div className="mt-5">
            <Button as={Link} href="/designers" variant="primary" onClick={() => track('howitworks_start', { where: compact ? 'modal' : 'page' })}>Start Color Story</Button>
          </div>
        </div>
        <div className="order-1 md:order-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border bg-[var(--color-linen)]/40">
            <Image
              src="/marketing/howitworks.svg"
              alt="How it works preview"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
