import { createClient } from '@supabase/supabase-js'
import { ConfigError } from '../errors'

// Call this ONLY at request time (never in module scope of a Client Component).
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  const missing: string[] = []
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!key) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (missing.length) {
    throw new ConfigError('Missing Supabase environment variables', missing)
  }
  return createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// Back-compat alias: some routes may still import { supabaseAdmin }.
// Keep it as a *function* to avoid creating a client at build time.
export const supabaseAdmin = getSupabaseAdminClient

export type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>

