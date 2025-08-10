"use client"
import { motion } from 'framer-motion'
import { useState } from 'react'

export interface SwatchColor { brand:string; name:string; code:string; hex:string; role:string }

interface Props { color: SwatchColor; onCopy?: (c:SwatchColor)=>void }

export default function SwatchCard({ color, onCopy }: Props){
  const [copied,setCopied]=useState(false)
  function copy(){
    navigator.clipboard.writeText(color.hex)
    setCopied(true)
    onCopy?.(color)
    setTimeout(()=>setCopied(false), 1600)
  }
  return (
    <motion.div layout initial={false} whileHover={{ y:-4 }} transition={{ type:'spring', stiffness:300, damping:25 }}
      className="group relative rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-sm">
      <button onClick={copy} aria-label={`Copy ${color.name} ${color.hex}`} className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[10px] font-medium bg-[var(--bg-surface)]/80 backdrop-blur border border-[var(--border)] opacity-0 group-hover:opacity-100 transition focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">{copied? 'Copied':'Copy'}</button>
      <div className="h-32 w-full" style={{ backgroundColor: color.hex }} />
      <div className="p-4">
        <div className="font-medium text-sm flex items-center gap-2"><span>{color.name}</span><span className="text-[10px] uppercase tracking-wide text-[var(--ink-subtle)]">{color.role}</span></div>
        <div className="text-[11px] mt-1 text-[var(--ink-subtle)]">{color.code} · {color.brand}</div>
        <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--ink-subtle)]">
          <span className="px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-canvas)]">{color.hex}</span>
        </div>
      </div>
    </motion.div>
  )
}
