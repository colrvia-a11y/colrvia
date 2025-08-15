import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

export type UndertoneResult = {
  undertone: 'warm' | 'cool' | 'neutral' | 'mixed'
  confidence: number
  swatches: { hex: string; percent: number }[]
  notes?: string
}

export const viaTools = {
  // Tool 1: Analyze image for undertones (fast heuristic; good enough for chat)
  async analyzeImageForUndertones(url: string): Promise<UndertoneResult> {
    if (!url) throw new Error('image url required')
    // Fetch the image
    const res = await fetch(url)
    if (!res.ok) throw new Error(`image fetch failed: ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    // Downsample and get raw pixels
    const { data, info } = await sharp(buf).resize(64, 64, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const total = info.width * info.height
    // Simple quantization: bucket RGB to 16 steps/channel to build a palette
    const buckets = new Map<string, number>()
    let warm = 0, cool = 0, neutral = 0
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      // HSL conversion
      const [h, s, l] = rgbToHsl(r, g, b)
      // Undertone buckets
      if (s < 0.18 && l > 0.35 && l < 0.95) {
        neutral++
        // light red tilt counts as warm; blue tilt as cool
        if (r > b + 10 && r > g + 10) warm++
        else if (b > r + 10 && b > g + 10) cool++
      } else {
        if (h >= 20 && h <= 70) warm++ // yellow–warm reds
        else if (h >= 180 && h <= 260) cool++ // cyan–blue
      }
      // Palette bucketing
      const R = Math.round(r / 16) * 16
      const G = Math.round(g / 16) * 16
      const B = Math.round(b / 16) * 16
      const key = `${R},${G},${B}`
      buckets.set(key, (buckets.get(key) || 0) + 1)
    }
    const warmPct = warm / total, coolPct = cool / total, neutralPct = neutral / total
    const maxPct = Math.max(warmPct, coolPct, neutralPct)
    const undertone = maxPct < 0.4 ? 'mixed' : (maxPct === warmPct ? 'warm' : maxPct === coolPct ? 'cool' : 'neutral')
    // Top 3 swatches
    const top = [...buckets.entries()].sort((a,b)=>b[1]-a[1]).slice(0, 3).map(([k,count])=>{
      const [R,G,B] = k.split(',').map(Number)
      return { hex: rgbToHex(R,G,B), percent: count/total }
    })
    return {
      undertone,
      confidence: clamp01(maxPct),
      swatches: top,
      notes: 'Heuristic analysis; lighting/white balance can affect perceived undertones.'
    }
  },

  // Tool 2: Paint facts lookup (Supabase). Query by name, code, or brand.
  async getPaintFacts(query: string) {
    if (!query) throw new Error('query required')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return { results: [], warning: 'Supabase envs missing; returning empty results.' }
    const supabase = createClient(url, key, { auth: { persistSession:false }, db: { schema: 'public' } })
    // Example table schema: paint_colors(name, brand, code, hex, lab_l, lab_a, lab_b, undertone, notes)
    const { data, error } = await supabase
      .from('paint_colors')
      .select('name,brand,code,hex,undertone,notes')
      .ilike('name', `%${query}%`)
      .limit(5)
    if (error) return { results: [], warning: error.message }
    return { results: data || [] }
  }
}

// ---------- small helpers ----------
function rgbToHex(r:number,g:number,b:number) {
  return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')
}
function rgbToHsl(r:number,g:number,b:number): [number, number, number] {
  r/=255; g/=255; b/=255
  const max=Math.max(r,g,b), min=Math.min(r,g,b)
  let h=0,s=0; const l=(max+min)/2
  if(max!==min){
    const d=max-min
    s=l>0.5 ? d/(2-max-min) : d/(max+min)
    switch(max){
      case r: h=(g-b)/d+(g<b?6:0); break
      case g: h=(b-r)/d+2; break
      case b: h=(r-g)/d+4; break
    }
    h/=6
  }
  return [Math.round(h*360), s, l]
}
function clamp01(x:number){ return Math.max(0, Math.min(1, x)) }
