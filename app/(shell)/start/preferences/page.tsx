"use client"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PreferencesAlias(){
  const sp = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    const d = sp.get('designerId')
    if (d) {
      router.replace(`/preferences/${d}`)
    } else {
      router.replace('/designers')
    }
  }, [sp, router])
  return <main className="px-4 py-12 text-sm text-muted-foreground">Loading preferences…</main>
}
