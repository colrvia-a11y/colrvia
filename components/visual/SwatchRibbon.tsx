"use client"
import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useReducedMotion } from '@/components/theme/MotionSettings'

interface Swatch { hex:string; name?:string }
interface SwatchRibbonProps { swatches: Swatch[] }

export default function SwatchRibbon({ swatches }: SwatchRibbonProps){
  const [copied, setCopied] = useState<string>('')
  const reduced = useReducedMotion()
  async function copy(hex:string){
    try { await navigator.clipboard.writeText(hex); setCopied(hex); setTimeout(()=>setCopied(''), 1500) } catch {}
  }
  return (
    <div className="flex items-end gap-3" aria-label="Color swatches">
      {swatches.slice(0,5).map((s,i)=> {
        const delay = reduced? 0 : i * 60
        return (
        <button key={i} onClick={()=>copy(s.hex)} className={clsx('group relative h-14 w-14 rounded-xl border border-[var(--border)] shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] transition-all duration-[var(--dur-swatch)] ease-colrvia will-change-transform origin-bottom', copied===s.hex && 'ring-2 ring-[var(--brand)]')} style={{background:s.hex, animation: reduced? undefined : `swatchIn var(--dur-swatch) ${delay}ms both`}} aria-label={`Copy ${s.name||'swatch'} ${s.hex}`}>
          <span className="sr-only">{copied===s.hex?'Copied ':''}{s.hex}</span>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-[var(--ink-subtle)] whitespace-nowrap">{s.name||s.hex}</span>
        </button>
      )})}
      <div aria-live="polite" className="sr-only">{copied?`Copied ${copied}`:''}</div>
    </div>
  )
}
