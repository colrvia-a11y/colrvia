'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const href = typeof window !== 'undefined' ? window.location.href : ''
        const hash = typeof window !== 'undefined' ? window.location.hash : ''
        const supabase = supabaseBrowser()

        if (hash.includes('access_token')) {
          // Hash-based magic link
          // @ts-expect-error: typings may not yet include this method
          const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
          if (error) throw error
          if (typeof window !== 'undefined') {
            history.replaceState({}, document.title, window.location.pathname)
          }
        } else {
          // PKCE/code flow
          const { error } = await supabase.auth.exchangeCodeForSession(href)
          if (error) throw error
        }

        router.replace('/dashboard')
      } catch (e) {
        console.error('auth callback error', e)
        router.replace('/sign-in')
      }
    })()
  }, [router])

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-2">Signing you in…</h1>
      <p className="text-neutral-600">Please wait.</p>
    </main>
  )
}
