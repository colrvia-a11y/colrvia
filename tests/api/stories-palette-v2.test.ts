import { describe, it, expect, vi } from 'vitest';
// Use real Sherwin-Williams catalog data so validator passes.
import sw from '@/data/brands/sw.json';

vi.mock('@/lib/supabase/server', () => {
  const client = () => {
    const swatches = [
      { brand:'sherwin_williams', code:'SW 7008', name:'Alabaster', hex:'#FFFFFF' },
      { brand:'sherwin_williams', code:'SW 7036', name:'Accessible Beige', hex:'#E5D8C8' },
      { brand:'sherwin_williams', code:'SW 7043', name:'Worldly Gray', hex:'#D8D4CE' },
      { brand:'sherwin_williams', code:'SW 6204', name:'Sea Salt', hex:'#CDD8D2' },
      { brand:'sherwin_williams', code:'SW 7005', name:'Pure White', hex:'#FEFEFE' },
    ]
    return {
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
      from: () => ({
        insert: () => ({ select: () => ({ single: async () => ({ data: { id: 'story-1' }, error: null }) }) }),
        select: () => ({ eq: () => ({ single: async () => ({ data: { id:'story-1', palette: swatches, vibe:'Cozy Neutral', brand:'sherwin_williams' }, error: null }) }) })
      })
    }
  }
  return { supabaseServer: client, createSupabaseServerClient: client }
})

vi.mock('@/lib/palette/normalize-repair', () => ({
  normalizePaletteOrRepair: async (p: any) => p,
}))
vi.mock('@/lib/ai/orchestrator', () => ({
  designPalette: async () => ({
    swatches: [
      { brand: 'sherwin_williams', code: 'SW 1', name: 'Color1', hex: '#111111', role: 'primary' },
      { brand: 'sherwin_williams', code: 'SW 2', name: 'Color2', hex: '#222222', role: 'secondary' },
      { brand: 'sherwin_williams', code: 'SW 3', name: 'Color3', hex: '#333333', role: 'accent' },
      { brand: 'sherwin_williams', code: 'SW 4', name: 'Color4', hex: '#444444', role: 'trim' },
      { brand: 'sherwin_williams', code: 'SW 5', name: 'Color5', hex: '#555555', role: 'ceiling' },
    ],
    placements: { primary: 60, secondary: 30, accent: 10, trim: 5, ceiling: 5 },
  }),
}))

function makeValidV2Palette() {
  const list = sw as any[];
  const pick = (i: number) => {
    const c: any = list[i % list.length];
    return {
      brand: 'Sherwin-Williams',
      code: String(c.code || c.id || c.number || c.slug || i),
      name: String(c.name || `Color ${i}`),
      hex: String(c.hex).startsWith('#') ? String(c.hex) : `#${String(c.hex)}`,
    };
  };
  return {
    swatches: [
      { role: 'primary', ...pick(0) },
      { role: 'secondary', ...pick(1) },
      { role: 'accent', ...pick(2) },
      { role: 'trim', ...pick(3) },
      { role: 'ceiling', ...pick(4) },
    ],
    placements: { primary: 60, secondary: 30, accent: 10, trim: 5, ceiling: 5 },
    notes: ['test'],
  };
}

function req(body: any) {
  return new Request('http://localhost/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/stories accepts palette_v2 (flag on)', () => {
  it('returns success (not 422 Invalid palette) for a valid v2 payload', async () => {
    (process as any).env.AI_ALLOW_CLIENT_PALETTE = 'true';
    const mod = await import('../../app/api/stories/route');
    const palette_v2 = makeValidV2Palette();
    const r = await (mod as any).POST(req({ palette_v2, seed: 'test-accept-v2', prompt: 'x' }) as any);
    const status = (r as Response).status;
    const body = await (r as Response).json().catch(() => ({}));
    if (body?.error) {
      expect(String(body.error)).not.toMatch(/Invalid palette/);
    }
    expect(status).not.toBe(422);
  });
});
