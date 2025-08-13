import React from 'react'
import Link from 'next/link'
import { Mic } from 'lucide-react'

export default function InterviewIntro() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#0d1b12] text-white">
      <header className="mb-8">
        <p className="font-display text-2xl">Colrvia</p>
        <p className="text-sm text-white/60 mt-2">Designer interview · voice-first · ~10 minutes</p>
      </header>

      <h1 className="text-2xl font-semibold mb-4">Your personal design interview</h1>
      <p className="text-lg text-white/80 mb-2">Voice-first conversation with Moss · ~10 minutes</p>
      <p className="text-base text-white/60 mb-8">Let&rsquo;s discover your perfect paint palette.</p>

      <div className="mb-8">
        <Mic className="w-20 h-20 text-[#f2b897]" />
      </div>

      <Link
        href="/start/interview"
        className="w-full max-w-xs bg-[#f2b897] text-[#0d1b12] py-4 rounded-lg font-bold text-lg hover:bg-[#f6c5a3] transition"
      >
        Let&rsquo;s Start
      </Link>

      <p className="mt-4 text-sm text-white/60">No typing needed — just speak naturally.</p>
    </main>
  )
}
