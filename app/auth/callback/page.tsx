"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function run() {
      const supabase = supabaseBrowser();
      try {
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Hash-based magic link flow
          // @ts-expect-error: getSessionFromUrl may not yet be in types
          await supabase.auth.getSessionFromUrl({ storeSession: true });
          history.replaceState({}, document.title, window.location.pathname);
        } else {
          // Code / PKCE flow
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
        router.replace('/dashboard');
      } catch (e) {
        console.error('auth callback error', e);
        router.replace('/sign-in');
      }
    }
    run();
  }, [router])

  return (
    <main className="max-w-sm mx-auto p-8 text-center">
      <p className="text-sm text-neutral-600">Signing you in…</p>
    </main>
  )
}
