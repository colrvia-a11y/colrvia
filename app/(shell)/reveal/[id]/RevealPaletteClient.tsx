'use client'
import { useState } from 'react'
import PaletteGrid from '@/components/reveal/PaletteGrid'
import type { DecodedSwatch } from '@/types/story'
import type { SwatchColor } from '@/components/reveal/SwatchCard'

export default function RevealPaletteClient({ palette }: { palette: DecodedSwatch[] }) {
  const [lastCopied, setLastCopied] = useState<string | null>(null)
  async function handleCopy(s: { hex?: string; name?: string }) {
    if(!s.hex) return
    try {
      await navigator.clipboard.writeText(s.hex)
      setLastCopied(s.hex)
      if(typeof window !== 'undefined'){
        window.dispatchEvent(new CustomEvent('swatch-copied', { detail:{ hex:s.hex, name:s.name }}))
      }
    } catch {}
  }
  const adapted: SwatchColor[] = palette.filter(p=>p.hex).map(p=>({
    hex: p.hex!,
    name: p.name || p.code || p.hex!,
    code: p.code || p.name || p.hex!,
    brand: (p.brand || '').toString() || 'SW',
    role: (p.role || 'walls')
  }))
  return <PaletteGrid palette={adapted} onCopy={(c)=>handleCopy({ hex:c.hex, name:c.name })} />
}
