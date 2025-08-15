import { describe, it, expect } from 'vitest'
import { normalizePaletteOrRepair } from '@/lib/palette/normalize-repair'

class StubSB {
  tablesHit:string[] = []
  topup = [
    { code:'B100', name:'Behr Sample', hex:'#fafafa' },
    { code:'B200', name:'Behr Sample 2', hex:'#f0f0f0' },
    { code:'B300', name:'Behr Sample 3', hex:'#eeeeee' },
    { code:'B400', name:'Behr Sample 4', hex:'#dddddd' },
    { code:'B500', name:'Behr Sample 5', hex:'#cccccc' },
    { code:'B600', name:'Behr Sample 6', hex:'#bbbbbb' },
  ]
  from(name:string){ this.tablesHit.push(name); return this }
  select(){ return this }
  in(){ return { data: [], error: null } as any }
  ilike(){ return this }
  order(){ return this }
  limit(){ return { data: this.topup, error: null } as any }
  eq(){ return { data: [], error: null } as any }
}

describe('normalizePaletteOrRepair brand routing', () => {
  it('uses Behr catalog and returns behr brand', async () => {
    const sb:any = new StubSB()
    const res = await normalizePaletteOrRepair([], 'Cozy Neutral', 'behr', { supabase: sb })
    expect(sb.tablesHit.some(t => t === 'catalog_behr')).toBe(true)
    expect(res[0].brand).toBe('behr')
    expect(res).toHaveLength(5)
  })
})
