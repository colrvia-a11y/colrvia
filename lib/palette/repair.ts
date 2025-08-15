import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { ConfigError } from '@/lib/errors'

export async function repairStoryPalette({ id }:{ id: string }): Promise<{ ok:true } | { ok:false; reason:string }>{
  let sb
  try {
    sb = getSupabaseAdminClient()
  } catch (e) {
    if ((e as any)?.name === 'ConfigError') return { ok: false, reason: 'env' }
    throw e
  }
  const { data, error } = await sb.from('stories').select('id, palette, vibe, brand').eq('id', id).single()
  if(error || !data) return { ok:false, reason:'not_found' }
  let repaired
  try {
    repaired = await normalizePaletteOrRepair(data.palette as any, (data as any).vibe)
  } catch {
    try {
      repaired = await normalizePaletteOrRepair([], (data as any).vibe)
    } catch {
      return { ok:false, reason:'unrepairable' }
    }
  }
  const { error: upErr } = await sb.from('stories').update({ palette: repaired, has_variants:false }).eq('id', id)
  if(upErr) return { ok:false, reason:'update_fail' }
  return { ok:true }
}
