import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if(!url || !anon) throw new Error('Supabase public env missing')
  return createClient(url, anon)
}
