"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * AuthHashListener
 * Listens for a Supabase magic-link hash (contains access_token) and
 * finalizes the session client-side. Useful when a user lands on any
 * page with the hash fragment instead of a dedicated callback route.
 */
export function AuthHashListener() {
  const router = useRouter()

  useEffect(() => {
    let active = true
    async function finalize() {
      if (typeof window === 'undefined') return
      if (!window.location.hash.includes('access_token')) return
      try {
        const supabase = supabaseBrowser()
        // getSessionFromUrl may not be present in older type definitions
        // @ts-expect-error - rely on runtime availability
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true })
        if (error) throw error
        if (!active) return
        // Clean the URL (remove sensitive hash) before navigation
        const { pathname, search } = window.location
        window.history.replaceState(null, '', pathname + search)
        router.replace('/dashboard')
      } catch (err) {
        console.error('Auth hash handling failed:', err)
        if (!active) return
        router.replace('/sign-in')
      }
    }
    finalize()
    return () => { active = false }
  }, [router])

  return null
}

export default AuthHashListener
