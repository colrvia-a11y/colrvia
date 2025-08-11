import { supabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name}`)
  return v
}

export async function getUserTier() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { tier: 'free' as const, user: null }
  const { data } = await supabase.from('profiles').select('tier').eq('user_id', user.id).single()
  return { tier: (data?.tier ?? 'free') as 'free'|'pro', user }
}

export async function setUserTierAdmin(userId: string, tier: 'free'|'pro') {
  const admin = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken:false, persistSession:false } })
  const { error } = await admin.from('profiles').update({ tier }).eq('user_id', userId)
  if (error) throw new Error('Failed updating tier: ' + error.message)
  return true
}
