// lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js"

export function supabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient() must not be used in the browser')
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase admin client requires URL and SERVICE_ROLE key')
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function createAdminClient() {
  return supabaseAdmin()
}
