'use client'
import { getSettings, setSettings, onSettingsChange } from '@/lib/settings/store'
import { useEffect, useState } from 'react'
export default function ThemeToggle(){
  const [v,setV]=useState(getSettings().theme)
  useEffect(()=> onSettingsChange(()=>setV(getSettings().theme)),[])
  function apply(t:'system'|'light'|'dark'){
    setSettings({theme:t}); const el=document.documentElement
    if (t==='system') { el.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches) }
    else { el.classList.toggle('dark', t==='dark') }
  }
  const Btn=({t,label}:{t:'system'|'light'|'dark';label:string})=>(
    <button
      type="button"
      onClick={()=>apply(t)}
      className={`px-3 py-2 rounded-xl border ${v===t?'bg-[var(--surface-elev)] border-[var(--accent)]':'border-[var(--border)]'}`}
    >
      {label}
    </button>
  )
  return (
    <div className="flex gap-2">
      <Btn t="system" label="System"/>
      <Btn t="light" label="Light"/>
      <Btn t="dark" label="Dark"/>
    </div>
  )
}
