"use client"
import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import nextDynamic from "next/dynamic"
import { useState } from "react"
const HowItWorksModal = nextDynamic(() => import("@/components/marketing/HowItWorksModal"), { ssr: false })
import { useStartStory } from "@/components/ux/StartStoryPortal"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  // @ts-ignore client boundary ok
  const [open, setOpen] = useState(false)
  const startStory = useStartStory()
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12 bg-[var(--olive-700)] text-[var(--cream-50)]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,var(--olive-500),transparent_60%),radial-gradient(circle_at_70%_80%,var(--olive-900),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(64,73,52,0)_0%,var(--olive-700)_90%)]" />
      </div>
      <div className="relative space-y-10">
        <header className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-[var(--sage-200)]">instant color confidence</p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl leading-[1.05] font-semibold"
            >
              from vibe to walls in minutes.
              <br />
              <span className="text-[var(--peach-300)]">real paint codes. clear placements.</span>
            </motion.h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-5 py-2 rounded-full border border-[var(--olive-600)] text-sm hover:bg-[var(--olive-600)]/30 transition"
            >How it works</button>
          </div>
        </header>
        <div className="mt-8">
          <Link
            href="/designers"
            onClick={(e) => { e.preventDefault(); startStory("/designers") }}
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl md:text-2xl font-semibold w-full sm:w-auto hover:opacity-95"
            style={{ backgroundColor: "var(--peach-300)", color: "var(--slate-800)" }}
          >
            Start Color Story
          </Link>
        </div>
      </div>
      <HowItWorksModal open={open} onOpenChange={setOpen} origin="home" />
    </main>
  )
}
