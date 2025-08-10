"use client"

import { supabaseBrowser } from '@/lib/supabase/client'

/**
 * Displays sign in and sign out buttons. Uses Supabase client-side auth
 * helpers to handle OAuth flows and sign out. Currently configured for
 * Google sign in; extend to other providers if needed.
 */
export function AuthButtons() {
  const signIn = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` }
    })
  }

  const signOut = async () => {
    const supabase = supabaseBrowser()
    await supabase.auth.signOut()
    // refresh page to update server-side session
    location.reload()
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={signIn}
        className="rounded-xl px-4 py-2 bg-black text-white"
      >
        Sign in
      </button>
      <button
        onClick={signOut}
        className="rounded-xl px-4 py-2 border"
      >
        Sign out
      </button>
    </div>
  )
}