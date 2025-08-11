import { createClient } from '@supabase/supabase-js'
import { supabaseServer } from '@/lib/supabase/server'

function requireEnv(name:string){ const v=process.env[name]; if(!v) throw new Error('Missing env '+name); return v }

export async function getIndexForUser(userId: string){
  const supabase = supabaseServer()
  const { data, error } = await supabase.from('stories')
    .select('id,title,brand,vibe,palette,created_at,variant,photo_url')
    .eq('user_id', userId)
    .eq('variant','recommended')
    .order('created_at',{ ascending:false })
  if (error) return []
  if (!data) return []
  const ids = data.map(s=>s.id)
  if (ids.length===0) return []
  const { data: children } = await supabase.from('stories').select('parent_id, id').in('parent_id', ids)
  const map = new Set(children?.map(c=>c.parent_id) || [])
  return data.map(s=> ({ id:s.id, title:s.title, brand:s.brand, vibe:s.vibe, palette:s.palette, created_at:s.created_at, photoUrl: (s as any).photo_url, hasVariants: map.has(s.id) }))
}

export async function markHasVariants(parentId: string){
  try {
  const admin = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), { auth:{ autoRefreshToken:false, persistSession:false } })
    await admin.from('stories').update({ has_variants:true }).eq('id', parentId)
  } catch {}
}

export async function recomputeHasVariants(parentId: string){
  try {
  const admin = createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), { auth:{ autoRefreshToken:false, persistSession:false } })
    const { count } = await admin.from('stories').select('id',{ count:'exact', head:true }).eq('parent_id', parentId)
    await admin.from('stories').update({ has_variants: (count??0) > 0 }).eq('id', parentId)
  } catch {}
}
