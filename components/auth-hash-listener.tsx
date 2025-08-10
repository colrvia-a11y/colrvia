 'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthHashListener() {
  const router = useRouter()

  useEffect(() => {
    async function run() {
      if (typeof window === 'undefined') return
      const hash = window.location.hash || ''
      // Only run if magic-link dropped us on a URL with tokens in the hash
      if (!hash.includes('access_token') && !hash.includes('refresh_token')) return

      const supabase = supabaseBrowser()
  // @ts-expect-error: getSessionFromUrl may not exist in installed typings yet
  const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
      if (error) {
        console.error('auth hash listener error', error)
        router.replace('/sign-in')
        return
      }
      // Clean the URL (remove hash) and go to dashboard
      history.replaceState({}, document.title, window.location.pathname)
      router.replace('/dashboard')
    }
    run()
  }, [router])

  return null
}
