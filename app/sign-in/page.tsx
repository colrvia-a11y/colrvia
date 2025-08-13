"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase/browser'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

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
  const t = useTranslations('SignInPage')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_SITE_URL ?? '')

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email) { setMsg(t('messages.enterEmail')); return }
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (error) throw error
      setMsg(t('messages.checkEmailMagicLink'))
    } catch (err: any) {
      setMsg(err.message || t('messages.couldNotSendMagicLink'))
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
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
      })
      if (error) throw error
      // the browser will redirect; nothing else to do
    } catch (err: any) {
      setMsg(err.message || t('messages.googleSignInFailed'))
      setBusy(false)
    }
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) { setMsg(t('messages.emailPasswordRequired')); return }
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.session) {
        try { await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_IN', access_token: data.session.access_token, refresh_token: data.session.refresh_token }) }) } catch {}
        window.location.href = next
      }
      else setMsg(t('messages.signedInRedirecting'))
    } catch (err:any) {
      setMsg(err.message || t('messages.signInFailed'))
    } finally { setBusy(false) }
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    if (!email || !password) { setMsg(t('messages.emailPasswordRequired')); return }
    if (password.length < 6) { setMsg(t('messages.passwordMin')); return }
    if (password !== confirm) { setMsg(t('messages.passwordsNoMatch')); return }
    setBusy(true)
    try {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` } })
      if (error) throw error
      if (data.user && !data.session) {
        setAwaitingConfirm(true)
        setMsg(t('messages.checkEmailConfirm'))
      } else {
        if (data.session) {
          try { await fetch('/api/auth/sync', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ event:'SIGNED_IN', access_token: data.session.access_token, refresh_token: data.session.refresh_token }) }) } catch {}
          window.location.href = next
        }
      }
    } catch (err:any) {
      setMsg(err.message || t('messages.signUpFailed'))
    } finally { setBusy(false) }
  }

  async function resendConfirmation(){
    if(!email) return
    setBusy(true)
    setMsg(null)
    try {
      const { error } = await supabase.auth.resend({ type:'signup', email }) as any
      if(error) throw error
      setMsg(t('messages.confirmationResent'))
    } catch(err:any){
      setMsg(err.message || t('messages.couldNotResend'))
    } finally { setBusy(false) }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="text-sm tracking-widest font-medium mb-6">{t('brand')}</div>
      <h1 className="text-2xl font-semibold mb-2">{mode==='magic' ? t('titleSignIn') : (pwPhase==='signin'? t('titleSignIn') : t('titleCreate'))}</h1>
      <div className="flex gap-3 mb-6 text-sm" role="tablist">
        <button type="button" role="tab" aria-selected={mode==='magic'} onClick={()=>{ setMode('magic'); setMsg(null) }} className={`px-3 py-1 rounded-full border ${mode==='magic'?'bg-black text-white':'bg-white'}`}>{t('magicLinkTab')}</button>
        <button type="button" role="tab" aria-selected={mode==='password'} onClick={()=>{ setMode('password'); setMsg(null) }} className={`px-3 py-1 rounded-full border ${mode==='password'?'bg-black text-white':'bg-white'}`}>{t('passwordTab')}</button>
      </div>

      {mode==='magic' && (
  <form onSubmit={sendMagicLink} className="space-y-3 mb-6">
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('emailPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
          <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? t('sendMagicLinkBusy') : t('sendMagicLinkIdle')}</button>
        </form>
      )}

      {mode==='password' && (
        <div className="mb-6">
          {pwPhase==='signin' && (
            <form onSubmit={signInWithPassword} className="space-y-3">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('emailPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('passwordPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? t('signInSubmitBusy') : t('signInSubmitIdle')}</button>
            </form>
          )}
          {pwPhase==='signup' && (
            <form onSubmit={signUpWithPassword} className="space-y-3">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('emailPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('passwordMinPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required minLength={6} />
              <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={t('confirmPasswordPlaceholder')} className="w-full rounded-xl border px-3 py-2" disabled={busy} required />
              <button type="submit" disabled={busy} className="w-full rounded-2xl py-3 bg-black text-white">{busy? t('createAccountSubmitBusy') : t('createAccountSubmitIdle')}</button>
            </form>
          )}
          <div className="mt-4 text-xs text-neutral-600">
            {pwPhase==='signin' ? (
              <button type="button" onClick={()=>{ setPwPhase('signup'); setMsg(null); setAwaitingConfirm(false) }} className="underline">{t('needAccount')}</button>
            ) : (
              <button type="button" onClick={()=>{ setPwPhase('signin'); setMsg(null); setAwaitingConfirm(false) }} className="underline">{t('haveAccount')}</button>
            )}
            {awaitingConfirm && (
              <div className="mt-3 flex flex-col gap-2">
                <span>{t('didntGetEmail')}</span>
                <button type="button" onClick={resendConfirmation} disabled={busy} className="underline text-left">{t('resendConfirmation')}</button>
                <span className="text-[11px] text-neutral-500">{t('addSiteUrl')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center my-4">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="px-3 text-xs text-neutral-500">{t('or')}</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button type="button" onClick={continueWithGoogle} disabled={busy} className="w-full rounded-2xl py-3 border">{t('continueWithGoogle')}</button>

      {msg && <p className="mt-4 text-sm text-neutral-700 whitespace-pre-line">{msg}</p>}
      <p className="mt-2 text-xs text-neutral-400">{t('redirectOrigin', { origin })}</p>
      <div className="mt-8 text-sm"><Link className="underline" href="/">{t('backToHome')}</Link></div>
    </main>
  )
}
