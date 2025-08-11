// Auth callback landing page for Supabase OAuth / Magic links
'use client'
export const dynamic = 'force-dynamic';
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

function Inner(){
  const router = useRouter()
  const params = useSearchParams()
  const [status,setStatus] = useState<'working'|'error'|'done'>('working')
  useEffect(()=>{
    let cancelled = false
    async function run(){
      const code = params.get('code')
      const next = params.get('next') || '/dashboard'
      try {
        if(code){
          const supabase = supabaseBrowser()
          // Exchange code for session (PKCE / OAuth) if present
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if(error) throw error
          if(cancelled) return
          setStatus('done')
          router.replace(next)
          return
        }
        // Fallback: if hash tokens, let the hash listener handle
        setStatus('done')
        router.replace(next)
      } catch(e){
        console.error('auth callback error', e)
        if(cancelled) return
        setStatus('error')
      }
    }
    run()
    return ()=>{ cancelled = true }
  },[params, router])
  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[var(--ink-subtle)]">
      {status==='working' && <div>Signing you in…</div>}
      {status==='error' && <div>Sign-in failed. <button onClick={()=>router.replace('/sign-in')} className="underline">Return to sign-in</button></div>}
      {status==='done' && <div>Redirecting…</div>}
    </div>
  )
}
export default function AuthCallbackPage(){
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-[var(--ink-subtle)]">Preparing…</div>}><Inner/></Suspense>
}
