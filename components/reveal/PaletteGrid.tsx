"use client"
import SwatchCard, { SwatchColor } from './SwatchCard'

interface PaletteGridProps { palette: SwatchColor[]; onCopy?: (c:SwatchColor)=>void }

export default function PaletteGrid({ palette, onCopy }: PaletteGridProps){
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6" role="list" aria-label="Palette colors">
      {palette.map((p,i)=> <SwatchCard key={i} color={p} index={i} total={palette.length} onCopy={onCopy} />)}
    </div>
  )
}
