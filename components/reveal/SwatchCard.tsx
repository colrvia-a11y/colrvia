"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { PlacementIcon } from './PlacementIcon'

export interface SwatchColor { brand:string; name:string; code:string; hex:string; role:string }

interface Props { color: SwatchColor; onCopy?: (c:SwatchColor)=>void; index?:number; total?:number }

export default function SwatchCard({ color, onCopy, index=0, total=0 }: Props){
  const [copied,setCopied]=useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  // Roving tabindex: first card focusable
  const [tabIndex,setTabIndex]=useState(index===0?0:-1)
  useEffect(()=>{ setTabIndex(index===0?0:-1) },[index])
  function onKey(e:React.KeyboardEvent){
    if(!ref.current) return
    if(['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault()
      const root = ref.current.parentElement?.parentElement // grid -> section wrapper
      const cards = root?.querySelectorAll('[data-swatch-card]') as NodeListOf<HTMLElement> | null
      if(!cards) return
      let nextIdx=index
      const perRow = 4 // approximate; responsive so this is best-effort
      switch(e.key){
        case 'ArrowRight': nextIdx = (index+1)%cards.length; break
        case 'ArrowLeft': nextIdx = (index-1+cards.length)%cards.length; break
        case 'ArrowDown': nextIdx = Math.min(cards.length-1, index+perRow); break
        case 'ArrowUp': nextIdx = Math.max(0, index-perRow); break
        case 'Home': nextIdx = 0; break
        case 'End': nextIdx = cards.length-1; break
      }
      cards.forEach((c,i)=> c.tabIndex = i===nextIdx?0:-1)
      cards[nextIdx].focus()
    } else if(e.key==='Enter' || e.key===' '){ copy(); }
  }
  function copy(){
    navigator.clipboard.writeText(color.hex)
    setCopied(true)
    onCopy?.(color)
    setTimeout(()=>setCopied(false), 1600)
  }
  return (
    <motion.div layout initial={false} whileHover={{ y:-4 }} transition={{ duration:0.25, ease:[.4,0,.2,1] }}
      ref={ref}
      data-swatch-card
      tabIndex={tabIndex}
      onKeyDown={onKey}
      role="group"
      aria-label={`${color.name} ${color.hex} ${color.role}`}
      className="group relative rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)]">
  <button type="button" onClick={copy} aria-label={`Copy ${color.name} ${color.hex}`} className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-[10px] font-medium bg-[var(--bg-surface)]/85 backdrop-blur border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-[opacity,background-color] duration-200 ease-[var(--motion-ease-standard)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] active:scale-[.97]">{copied? 'Copied':'Copy'}</button>
      <div className="h-32 w-full" style={{ backgroundColor: color.hex }} />
      <div className="p-4">
  <div className="font-medium text-sm flex items-center gap-2"><span>{color.name}</span><span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground"><PlacementIcon role={color.role} /> {color.role}</span></div>
  <div className="text-[11px] mt-1 text-muted-foreground">{color.code} · {color.brand}</div>
  <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
          <span className="px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--bg-canvas)]">{color.hex}</span>
        </div>
      </div>
    </motion.div>
  )
}
