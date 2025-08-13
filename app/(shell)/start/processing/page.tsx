"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPaletteFromInterview } from '@/lib/palette'
import { moss } from '@/lib/ai/phrasing'

export default function ProcessingPage() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    ;(async () => {
      const result = await createPaletteFromInterview()
      if (active && result?.id) {
        router.replace(`/reveal/${result.id}`)
      }
    })()
    return () => { active = false }
  }, [router])

  return <div>{moss.working()}</div>
}
