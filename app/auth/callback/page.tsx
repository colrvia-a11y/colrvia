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
        const search = typeof window !== 'undefined' ? window.location.search : ''
        const params = typeof window !== 'undefined' ? new URLSearchParams(search) : null
        const supabase = supabaseBrowser()

        // Surface provider error query params early
        if (params && params.get('error')) {
          const providerError = params.get('error_description') || params.get('error') || 'OAuth error'
          console.error('[auth/callback] provider error', providerError)
          throw new Error(providerError)
        }

        console.debug('[auth/callback] starting', { hasHash: !!hash, href })

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

        console.debug('[auth/callback] success; redirecting to /dashboard')
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
