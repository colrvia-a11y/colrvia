"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

// AuthHashListener: finalizes Supabase session when a magic-link hash with
// access_token or refresh_token is present, then cleans the URL and routes.
export function AuthHashListener() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    async function run() {
      if (typeof window === 'undefined') return
      const hash = window.location.hash
      if (!hash || (!hash.includes('access_token') && !hash.includes('refresh_token'))) return
      const supabase = supabaseBrowser()
      try {
        // @ts-expect-error: method may not be in older typings
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) {
          console.error('auth hash listener error', error)
          if (active) router.replace('/sign-in')
          return
        }
        // Remove hash fragment for cleanliness / security
        history.replaceState({}, document.title, window.location.pathname)
        if (active) router.replace('/dashboard')
      } catch (error) {
        console.error('auth hash listener error', error)
        if (active) router.replace('/sign-in')
      }
    }
    run()
    return () => { active = false }
  }, [router])

  return null
}

export default AuthHashListener
