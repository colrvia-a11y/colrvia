"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPaletteFromInterview } from '@/lib/palette'

export default function ProcessingPage() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      await createPaletteFromInterview()
      router.replace('/reveal/test')
    })()
  }, [router])

  return <div>Processing...</div>
}
