'use client'
import { getSettings, setSettings, onSettingsChange } from '@/lib/settings/store'
import { useEffect, useState } from 'react'
const PRESETS = ['#732CED','#675CFF','#F46A25','#1EB980','#0EA5E9']
export default function AccentPicker(){
  const [accent,setAccent]=useState(getSettings().accent || PRESETS[0])
  useEffect(()=> onSettingsChange(()=>setAccent(getSettings().accent || PRESETS[0])),[])
  function apply(hex:string){ setSettings({accent:hex}); document.documentElement.style.setProperty('--accent', hex) }
  return (
    <div className="flex gap-3">
      {PRESETS.map(h=>(
        <button type="button" key={h} onClick={()=>apply(h)} aria-label={`Accent ${h}`} className={`h-8 w-8 rounded-full border ${accent===h?'ring-2 ring-[var(--accent)]':''}`} style={{ background:h }} />
      ))}
    </div>
  )
}
