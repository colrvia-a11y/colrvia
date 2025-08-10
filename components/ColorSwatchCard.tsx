'use client'
import { motion } from 'framer-motion'
import type { PaletteColor } from '@/types/colorStory'

export default function ColorSwatchCard({ c }: { c: PaletteColor }) {
  return (
    <motion.div layout className="rounded-2xl border overflow-hidden">
      <div className="h-20 w-full" style={{ backgroundColor: c.hex }} />
      <div className="p-3 text-sm">
        <div className="font-medium">{c.name}</div>
        <div className="text-neutral-600">{c.hex} · {c.brand}</div>
        <div className="text-neutral-500 mt-1">{c.placement}</div>
      </div>
    </motion.div>
  )
}
