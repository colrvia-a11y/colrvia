'use client'
import { badge } from '@/lib/color/contrast'
import { useEffect, useState } from 'react'
type Swatch = { hex:string; name?:string }
export function PaletteCard({ title='Palette', swatches }:{ title?:string; swatches:Swatch[] }){
  const [paper,setPaper]=useState('#ffffff')
  useEffect(()=>{ const v=getComputedStyle(document.documentElement).getPropertyValue('--paper'); setPaper(v.trim()||'#ffffff') },[])
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3"><h3 className="font-semibold">{title}</h3></header>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3">
        {swatches.map((s,i)=>(
          <button type="button" key={i} onClick={()=>navigator.clipboard?.writeText(s.hex)} className="group rounded-xl overflow-hidden border border-[var(--border)] text-left">
            <div className="aspect-[4/3] sm:aspect-square" style={{ background: s.hex }} />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-medium">{s.name ?? s.hex}</span>
              <span className="text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)]">{badge('#000000', paper)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
