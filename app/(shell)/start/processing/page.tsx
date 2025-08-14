"use client"
import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPaletteFromInterview } from '@/lib/palette'
import { moss } from '@/lib/ai/phrasing'

export default function ProcessingPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [storyId, setStoryId] = useState<string | null>(sp.get('id'))
  const [attempts, setAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const running = useRef(false)

  useEffect(() => {
    if (storyId || running.current) return
    running.current = true
    let cancelled = false
    const MAX_ATTEMPTS = 5
    const run = async (n = 0) => {
      if (cancelled) return
      setAttempts(n + 1)
      const result = await createPaletteFromInterview()
      if (cancelled) return
      if (result?.id) {
        setStoryId(result.id)
        router.replace(`/reveal/${result.id}`)
        return
      }
      if (n + 1 >= MAX_ATTEMPTS) {
        setError('TIMEOUT')
        running.current = false
        return
      }
      const delay = 800 * Math.pow(2, n) // 0.8s, 1.6s, 3.2s, 6.4s, ...
      setTimeout(() => run(n + 1), delay)
    }
    run()
    return () => { cancelled = true }
  }, [storyId, router])

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      {!error ? (
        <>
          <p>{storyId ? moss.complete() : moss.working()}</p>
          {!storyId && <p className="text-sm text-neutral-500">Attempt {attempts}…</p>}
        </>
      ) : (
        <>
          <p className="text-red-600">Sorry — we couldn’t finish your Color Story.</p>
          <p className="text-sm text-neutral-600">Please try again, or go back to the interview.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setError(null); setAttempts(0); setStoryId(null); running.current = false; }}
              className="rounded-xl bg-black px-4 py-2 text-white"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => router.replace('/start/text-interview')}
              className="rounded-xl border px-4 py-2"
            >
              Back to Interview
            </button>
          </div>
        </>
      )}
      {storyId && (
        <button
          type="button"
          onClick={() => router.replace(`/reveal/${storyId}`)}
          className="rounded-xl bg-black px-4 py-2 text-white"
        >
          Reveal My Palette
        </button>
      )}
    </div>
  )
}
