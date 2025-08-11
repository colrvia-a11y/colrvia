"use client";
import { useEffect, useRef } from 'react'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (url && key) {
  supabase = createClient(url, key)
} else {
  console.warn('AUTH_SYNC_SUPABASE_ENV_MISSING', { url: !!url, key: !!key })
}

export function useAuthSync(){
  const syncedRef = useRef<string | null>(null)
  useEffect(()=>{
    if(!supabase) return
    let active = true
    async function syncIfNeeded(session: any){
      if(!active || !session?.user) return
      const uid = session.user.id
      if(syncedRef.current === uid) return
      const key = `auth_synced_v1:${uid}`
      if(typeof window !== 'undefined' && localStorage.getItem(key)){
        syncedRef.current = uid
        return
      }
      try {
        const res = await fetch('/api/auth/sync', { method:'POST', credentials:'same-origin' })
        if(res.ok || res.status === 204){
          syncedRef.current = uid
          if(typeof window !== 'undefined') localStorage.setItem(key, '1')
        } else {
          console.warn('AUTH_SYNC_CLIENT_FAIL', { status: res.status })
        }
      } catch(e){
        console.warn('AUTH_SYNC_CLIENT_FAIL', { error: (e as any)?.message })
      }
    }
    supabase.auth.getSession().then(({ data })=> syncIfNeeded(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session)=>{
      if(_event === 'SIGNED_IN') syncIfNeeded(session)
    })
    return ()=>{ active = false; sub.subscription.unsubscribe() }
  },[])
}
