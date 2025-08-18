'use client'
import { useMemo, useState } from 'react'
import { useCommandPalette } from './CommandPaletteProvider'

export default function CommandPalette(){
  const { setOpen, commands } = useCommandPalette()
  const [q,setQ]=useState('')
  const list = useMemo(()=> commands.filter(c=> c.label.toLowerCase().includes(q.toLowerCase())),[q,commands])
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[100] grid place-items-start sm:place-items-center p-2 sm:p-6">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={()=>setOpen(false)} />
      <div className="relative w-full sm:max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl overflow-hidden">
        <input autoFocus placeholder="Type a command…" value={q} onChange={e=>setQ(e.target.value)} className="w-full px-4 py-3 bg-transparent outline-none border-b border-[var(--border)]" />
        <ul className="max-h-80 overflow-auto p-1">
          {list.map(c=>(
            <li key={c.id}>
              <button type="button" onClick={()=>{ c.run(); setOpen(false) }} className="w-full text-left px-3 py-2 rounded-lg hover:bg-[color-mix(in_oklab,var(--surface)_80%,white_20%)]">
                {c.label}
              </button>
            </li>
          ))}
          {list.length===0 && <li className="px-3 py-3 text-sm text-[var(--ink-subtle)]">No matches</li>}
        </ul>
      </div>
    </div>
  )
}
