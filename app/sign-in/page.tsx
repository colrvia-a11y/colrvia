"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'

type Mode = 'magic' | 'password'
type PwPhase = 'signin' | 'signup'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [mode, setMode] = useState<Mode>('magic')
  const [pwPhase, setPwPhase] = useState<PwPhase>('signin')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
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
  console.debug('[sign-in] initiating Google OAuth', { origin })
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

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) { setMsg('Email and password required'); return }
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session) {
        try { await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_IN', access_token: data.session.access_token, refresh_token: data.session.refresh_token }) }) } catch {}
        window.location.href = '/dashboard'
      }
      else setMsg('Signed in, redirecting…')
    } catch (err:any) {
      setMsg(err.message || 'Sign in failed')
    } finally { setBusy(false) }
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) { setMsg('Email and password required'); return }
    if (password.length < 6) { setMsg('Password must be at least 6 characters'); return }
    if (password !== confirm) { setMsg('Passwords do not match'); return }
    setBusy(true)
    try {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } })
      if (error) throw error
      if (data.user && !data.session) {
        setAwaitingConfirm(true)
        setMsg('Check your email to confirm your address. If it does not arrive within a minute, check spam or click Resend below.')
      } else {
        if (data.session) {
          try { await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_IN', access_token: data.session.access_token, refresh_token: data.session.refresh_token }) }) } catch {}
          window.location.href = '/dashboard'
        }
      }
    } catch (err:any) {
      setMsg(err.message || 'Sign up failed')
    } finally { setBusy(false) }
  }

  async function resendConfirmation(){
    if(!email) return
    setBusy(true)
    setMsg(null)
    try {
      const { error } = await supabase.auth.resend({ type:'signup', email }) as any
      if(error) throw error
      setMsg('Confirmation email resent. Check inbox & spam.')
    } catch(err:any){
      setMsg(err.message || 'Could not resend confirmation email')
    } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="text-sm tracking-widest font-medium mb-6">COLRVIA</div>
      <h1 className="text-2xl font-semibold mb-2">{mode==='magic' ? 'Sign in' : (pwPhase==='signin'?'Sign in':'Create account')}</h1>
      <div className="flex gap-3 mb-6 text-sm" role="tablist">
        <button role="tab" aria-selected={mode==='magic'} onClick={()=>{ setMode('magic'); setMsg(null) }} className={`px-3 py-1 rounded-full border ${mode==='magic'?'bg-black text-white':'bg-white'}`}>Magic link</button>
        <button role="tab" aria-selected={mode==='password'} onClick={()=>{ setMode('password'); setMsg(null) }} className={`px-3 py-1 rounded-full border ${mode==='password'?'bg-black text-white':'bg-white'}`}>Email & password</button>
      </div>

      {mode==='magic' && (
        <form onSubmit={sendMagicLink} className="space-y-3 mb-6" aria-label="Magic link form">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
          <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? 'Sending…':'Send magic link'}</button>
        </form>
      )}

      {mode==='password' && (
        <div className="mb-6">
          {pwPhase==='signin' && (
            <form onSubmit={signInWithPassword} className="space-y-3" aria-label="Password sign in form">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? 'Signing in…':'Sign in'}</button>
            </form>
          )}
          {pwPhase==='signup' && (
            <form onSubmit={signUpWithPassword} className="space-y-3" aria-label="Password sign up form">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="w-full rounded-xl border px-3 py-2" disabled={busy} required minLength={6} />
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? 'Creating…':'Create account'}</button>
            </form>
          )}
          <div className="mt-4 text-xs text-neutral-600">
            {pwPhase==='signin' ? (
              <button type="button" onClick={()=>{ setPwPhase('signup'); setMsg(null); setAwaitingConfirm(false) }} className="underline">Need an account? Create one</button>
            ) : (
              <button type="button" onClick={()=>{ setPwPhase('signin'); setMsg(null); setAwaitingConfirm(false) }} className="underline">Have an account? Sign in</button>
            )}
            {awaitingConfirm && (
              <div className="mt-3 flex flex-col gap-2">
                <span>Didn’t get the email?</span>
                <button type="button" onClick={resendConfirmation} disabled={busy} className="underline text-left">Resend confirmation</button>
                <span className="text-[11px] text-neutral-500">Add this site URL to your Supabase Auth Redirect URLs if emails fail.</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center my-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="px-3 text-xs text-neutral-500">OR</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button onClick={continueWithGoogle} disabled={busy} className="w-full rounded-2xl py-3 border">Continue with Google</button>

      {msg && <p className="mt-4 text-sm text-neutral-700 whitespace-pre-line">{msg}</p>}
      <p className="mt-2 text-xs text-neutral-400">Redirect origin: {origin}</p>
      <div className="mt-8 text-sm"><Link className="underline" href="/">Back to home</Link></div>
    </main>
  )
}
