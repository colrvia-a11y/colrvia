"use client"
import { clsx } from 'clsx'

export interface DesignerMeta { id:string; name:string; headline:string; blurb:string; palette:string[] }
interface Props { designer: DesignerMeta; active: boolean; onSelect: ()=>void }

export default function DesignerCard({ designer, active, onSelect }: Props){
  return (
    <button type="button" onClick={onSelect} aria-pressed={active} aria-label={`Select designer ${designer.name}`}
      className={clsx('group text-left rounded-2xl border p-5 bg-[var(--bg-surface)] transition relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]', active && 'ring-2 ring-[var(--brand)]')}>
      <div className="font-medium mb-1 flex items-center gap-2">{designer.name}<span className="text-[10px] uppercase tracking-wide text-[var(--ink-subtle)]">{designer.headline}</span></div>
      <p className="text-[11px] leading-relaxed text-[var(--ink-subtle)] mb-4 min-h-[2.5rem]">{designer.blurb}</p>
      <div className="flex gap-1.5">
        {designer.palette.map(c=> <span key={c} className="h-5 w-5 rounded-md border border-[var(--border)]" style={{background:c}} aria-hidden />)}
      </div>
    </button>
  )
}
