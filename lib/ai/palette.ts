import type { GenerateInput, Swatch, Placements, Role } from '@/types/story';
import { getCatalog, findByTag, byName } from './catalog';

function normalizeBrand(brand: string) {
  return /behr/i.test(brand) ? 'Behr' : 'SW';
}
const pick = <T>(arr:T[], def?:T):T => arr[Math.floor(Math.random()*arr.length)] ?? (def ?? arr[0]);
const role = (paint: any, r: Role) => ({ ...paint, role: r });
export function buildPalette(input: GenerateInput) {
  const brand = normalizeBrand(input.brand);
  const cat = getCatalog(brand);
  // Walls candidates
  let walls = findByTag(brand,'walls');
  if (input.vibe === 'Cozy Neutral' || input.vibe==='Modern Warm') {
    walls = walls.length? walls : cat.filter(p => p.tags?.includes('neutral'));
  }
  if (input.vibe === 'Airy Coastal') {
    const airy = cat.filter(p => p.tags?.includes('coastal') || p.tags?.includes('light'));
    walls = airy.length ? airy : walls;
  }
  const wallsPaint = pick(walls, byName(brand, brand==='SW'?'Accessible Beige':'Blank Canvas')!);
  // Trim
  const trims = cat.filter(p => p.tags?.includes('trim')) ;
  const trimPaint = pick(trims, byName(brand, brand==='SW'?'Pure White':'Ultra Pure White')!);
  // Accent
  let accents = cat.filter(p => p.tags?.includes('accent'));
  if (input.vibe === 'Moody Blue-Green') {
    const moody = cat.filter(p => /green|blue/i.test(p.tags?.join(' ')||''));
    accents = moody.length? moody : accents;
  }
  const accentPaint = pick(accents, byName(brand, brand==='SW'?'Pewter Green':'Hawk Brown')!);
  // Cabinets (optional support)
  const cabinetsPaint = input.vibe.includes('Coastal')
    ? pick(cat.filter(p => p.tags?.includes('coastal') || p.tags?.includes('light')), wallsPaint)
    : pick(cat.filter(p => p.tags?.includes('neutral') && p.name!==wallsPaint.name), wallsPaint);
  const swatches: Swatch[] = [
    role(wallsPaint,'walls'),
    role(trimPaint,'trim'),
    role(cabinetsPaint,'cabinets'),
    role(accentPaint,'accent'),
  ];
  const placements: Placements = {
    walls: `${wallsPaint.name}`, trim: `${trimPaint.name}`,
    cabinets: cabinetsPaint ? cabinetsPaint.name : undefined,
    accent: accentPaint ? accentPaint.name : undefined,
    pct: { sixty:60, thirty:30, ten:10 }
  };
  return { swatches, placements };
}

// Deterministic seed palette based on brand + vibe fallback
export function seedPaletteFor(args: { brand: string; vibe?: string }) {
  const brand = normalizeBrand(args.brand)
  const cat = getCatalog(brand as any)
  // pick first neutral for walls, first trim tag, first accent tag etc.
  const walls = findByTag(brand as any,'walls')[0] || cat[0]
  const trim = cat.find(p=>p.tags?.includes('trim')) || walls
  const accent = cat.find(p=>p.tags?.includes('accent')) || walls
  const cabinets = cat.find(p=>p.tags?.includes('neutral') && p.name!==walls.name) || walls
  return [
    { ...walls, role:'walls' },
    { ...trim, role:'trim' },
    { ...cabinets, role:'cabinets' },
    { ...accent, role:'accent' },
    { ...(accent||walls), role:'extra' }
  ]
}
