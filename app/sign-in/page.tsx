'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const supabase = supabaseBrowser()

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? '')

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email) { setMsg('Please enter an email'); return }
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      })
      if (error) throw error
      setMsg('Check your email for the magic link.')
    } catch (err: any) {
      setMsg(err.message || 'Could not send magic link')
    } finally {
      setBusy(false)
    }
  }

  async function continueWithGoogle() {
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/auth/callback` },
      })
      if (error) throw error
      // the browser will redirect; nothing else to do
    } catch (err: any) {
      setMsg(err.message || 'Google sign-in failed')
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="text-sm tracking-widest font-medium mb-6">COLRVIA</div>
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-neutral-600 mb-6">
        Use a magic link sent to your email, or continue with Google.
      </p>

      <form onSubmit={sendMagicLink} className="space-y-3 mb-6">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border px-3 py-2"
          disabled={busy}
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl py-3 bg-black text-white"
        >
          {busy ? 'Sending…' : 'Send magic link'}
        </button>
      </form>

      <div className="flex items-center my-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="px-3 text-xs text-neutral-500">OR</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        onClick={continueWithGoogle}
        disabled={busy}
        className="w-full rounded-2xl py-3 border"
      >
        Continue with Google
      </button>

      {msg && <p className="mt-4 text-sm text-neutral-700">{msg}</p>}

      <div className="mt-8 text-sm">
        <Link className="underline" href="/">Back to home</Link>
      </div>
    </main>
  )
}
