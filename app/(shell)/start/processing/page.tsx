"use client"
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPaletteFromInterview } from '@/lib/palette'
import { moss } from '@/lib/ai/phrasing'

export default function ProcessingPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const [storyId, setStoryId] = useState<string | null>(sp.get('id'))

  useEffect(() => {
    let active = true
    if (!storyId) {
      ;(async () => {
        const result = await createPaletteFromInterview()
        if (active && result?.id) {
          setStoryId(result.id)
        }
      })()
    }
    return () => {
      active = false
    }
  }, [storyId])

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p>{storyId ? moss.complete() : moss.working()}</p>
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
