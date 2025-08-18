'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function StartPreferencesClient(){
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
