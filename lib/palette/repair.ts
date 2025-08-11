import { createClient } from '@supabase/supabase-js'
import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair'

export async function repairStoryPalette({ id }:{ id: string }): Promise<{ ok:true } | { ok:false; reason:string }>{
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE
  if(!url || !key) return { ok:false, reason:'env' }
  const sb = createClient(url, key, { auth:{ persistSession:false } })
  const { data, error } = await sb.from('stories').select('id, palette, vibe, brand').eq('id', id).single()
  if(error || !data) return { ok:false, reason:'not_found' }
  let repaired = await normalizePaletteOrRepair(data.palette as any, (data as any).vibe)
  if(!repaired){
    repaired = await normalizePaletteOrRepair([], (data as any).vibe)
  }
  if(!repaired){
    return { ok:false, reason:'unrepairable' }
  }
  const { error: upErr } = await sb.from('stories').update({ palette: repaired, has_variants:false }).eq('id', id)
  if(upErr) return { ok:false, reason:'update_fail' }
  return { ok:true }
}
