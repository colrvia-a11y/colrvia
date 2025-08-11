import { createClient } from '@supabase/supabase-js'

export type SWCode = `${'SW'} ${number}`
export const SW_FALLBACKS_BY_VIBE: Record<string, SWCode[]> = {
  cozy_neutral: ['SW 7008','SW 7036','SW 6106','SW 7043','SW 6204'],
  airy_coastal: ['SW 7005','SW 7064','SW 6478','SW 6232','SW 6525'],
  modern_warm:  ['SW 7008','SW 7568','SW 7037','SW 9109','SW 9171'],
  earthy_organic: ['SW 7036','SW 7043','SW 9126','SW 9109','SW 6204'],
  soft_pastels: ['SW 7005','SW 6525','SW 6478','SW 6232','SW 6204'],
  moody_blue_green: ['SW 6478','SW 6232','SW 7064','SW 6525','SW 7043'],
  default:      ['SW 7008','SW 7036','SW 7043','SW 6204','SW 7005']
}

function supabaseAdmin(){
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth:{ persistSession:false } })
}

export async function getSWSeedPalette(vibe?: string){
  const supabase = supabaseAdmin()
  const key = (vibe||'').toLowerCase().replace(/[^a-z]+/g,'_') || 'default'
  const list = SW_FALLBACKS_BY_VIBE[key] || SW_FALLBACKS_BY_VIBE.default
  const { data, error } = await supabase.from('catalog_sw').select('code,name,hex').in('code', list)
  if(error){
    return list.map(code=> ({ brand:'sherwin_williams', code, name: code, hex: undefined }))
  }
  const found = (data||[]).map(r=> ({ brand:'sherwin_williams', code: r.code, name: r.name, hex: r.hex }))
  const missingCodes = list.filter(c=> !found.find(f=>f.code===c))
  if(found.length < 5){
    const defaults = SW_FALLBACKS_BY_VIBE.default
    const { data: defData } = await supabase.from('catalog_sw').select('code,name,hex').in('code', defaults)
    const defFound = (defData||[]).map(r=> ({ brand:'sherwin_williams', code:r.code, name:r.name, hex:r.hex }))
    for(const c of defaults){
      if(found.length>=5) break
      const f = defFound.find(d=>d.code===c)
      if(f && !found.find(x=>x.code===f.code)) found.push(f)
    }
  }
  return found.slice(0,5)
}
