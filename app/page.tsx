"use client"
import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { useTranslations } from 'next-intl'
import nextDynamic from "next/dynamic"
import { useState } from "react"
const HowItWorksModal = nextDynamic(() => import("@/components/marketing/HowItWorksModal"), { ssr: false })
import { useStartStory } from "@/components/ux/StartStoryPortal"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  // @ts-ignore client boundary ok
  const [open, setOpen] = useState(false)
  const startStory = useStartStory()
  const t = useTranslations('HomePage')
  return (
    <main className="relative mx-auto max-w-3xl px-4 py-12 bg-[#404934] text-[#F7F7F2]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,#6d7b5d,transparent_60%),radial-gradient(circle_at_70%_80%,#2d3328,transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(64,73,52,0)_0%,#404934_90%)]" />
      </div>
      <div className="relative space-y-10">
        <header className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wide text-[#d1d9ce]">{t('tagline')}</p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl leading-[1.05] font-semibold"
            >
              {t('headline')}
              <br />
              <span className="text-[#f2b897]">{t('highlight')}</span>
            </motion.h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="px-5 py-2 rounded-full border border-[#566049] text-sm hover:bg-[#566049]/30 transition"
            >{t('howItWorks')}</button>
          </div>
        </header>
        <div className="mt-8">
          <Link
            href="/start/interview-intro"
            onClick={(e) => { e.preventDefault(); startStory("/start/interview-intro") }}
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 text-xl md:text-2xl font-semibold w-full sm:w-auto hover:opacity-95"
            style={{ backgroundColor: "#f2b897", color: "#1f2937" }}
          >
            {t('start')}
          </Link>
        </div>
      </div>
      <HowItWorksModal open={open} onOpenChange={setOpen} origin="home" />
    </main>
  )
}