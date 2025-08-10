"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    async function run() {
      const supabase = supabaseBrowser();
      try {
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          // Hash-based magic link flow
          // @ts-expect-error: getSessionFromUrl may not be in current type definitions
          await supabase.auth.getSessionFromUrl({ storeSession: true });
        } else {
          // Code / PKCE flow
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
        if (!active) return;
        router.replace('/dashboard');
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Authentication failed');
      }
    }
    run();
    return () => { active = false }
  }, [router])

  if (error) {
    return (
      <main className="max-w-sm mx-auto p-8 space-y-4 text-center">
        <h1 className="text-xl font-semibold">Authentication issue</h1>
        <p className="text-sm text-neutral-600">{error}</p>
        <a href="/sign-in" className="inline-block rounded-xl px-4 py-2 border text-sm">Return to sign in</a>
      </main>
    )
  }

  return (
    <main className="max-w-sm mx-auto p-8 space-y-4 text-center">
      <h1 className="text-xl font-semibold">Signing you in…</h1>
      <p className="text-sm text-neutral-500">Please wait while we complete authentication.</p>
    </main>
  )
}
