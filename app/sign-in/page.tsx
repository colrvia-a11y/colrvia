"use client"

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setMessage('Sending magic link…')
    try {
      const supabase = supabaseBrowser()
      const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL ?? '');
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback` }
      })
      if (error) throw error
      setStatus('sent')
      setMessage('Magic link sent! Check your email.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Failed to send magic link.')
    }
  }

  return (
    <main className="max-w-sm mx-auto p-8 space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Sign In</h1>
        <p className="text-sm text-neutral-500">Enter your email to receive a magic link.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded border px-3 py-2 text-sm bg-white"
            disabled={status === 'sending'}
          />
        </div>
        <button
          type="submit"
            disabled={!email.trim() || status === 'sending'}
          className="w-full rounded bg-black text-white py-2 text-sm font-medium disabled:opacity-50"
        >
          {status === 'sending' ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {message && (
        <p className={`text-sm text-center ${status === 'error' ? 'text-red-600' : 'text-neutral-600'}`}>{message}</p>
      )}
    </main>
  )
}
