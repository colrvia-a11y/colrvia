'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPaletteFromInterview } from '@/lib/palette'

export default function ResumeAfterAuth() {
  const router = useRouter()
  const [msg, setMsg] = useState('Finishing your Color Story…')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let answers: any = {}
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('colrvia:interview')
          if (raw) answers = JSON.parse(raw)?.answers ?? JSON.parse(raw) ?? {}
        }
        if (!answers || Object.keys(answers).length === 0) {
          setMsg('Nothing to resume — taking you back to the interview…')
          if (!cancelled) router.replace('/start/interview')
          return
        }
        const res = await createPaletteFromInterview(answers)
        if ('error' in res) {
          if (res.error === 'AUTH_REQUIRED') {
            if (!cancelled) router.replace('/sign-in?next=/auth/resume')
            return
          }
          setMsg('We hit a snag — taking you back to the interview…')
          if (!cancelled) router.replace('/start/interview')
          return
        }
        if (!cancelled) router.replace(`/reveal/${res.id}?optimistic=1`)
      } catch {
        setMsg('We hit a snag — taking you back to the interview…')
        if (!cancelled) router.replace('/start/interview')
      }
    })()
    return () => { cancelled = true }
  }, [router])

  return (
    <main className="min-h-screen grid place-items-center text-sm text-muted-foreground">
      {msg}
    </main>
  )
}
