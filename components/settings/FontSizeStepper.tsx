'use client'
import { getSettings, setSettings, onSettingsChange } from '@/lib/settings/store'
import { useEffect, useState } from 'react'
export default function FontSizeStepper(){
  const [scale,setScale]=useState(getSettings().fontScale)
  useEffect(()=> onSettingsChange(()=>setScale(getSettings().fontScale)),[])
  function apply(n:-1|0|1){ setSettings({fontScale:n}); document.documentElement.style.setProperty('--scale', n===-1?'0.95':n===1?'1.05':'1') }
  return (
    <div className="flex items-center gap-2">
      <button type="button" className="px-3 py-2 rounded-xl border border-[var(--border)]" onClick={()=>apply(-1)}>A-</button>
      <button type="button" className="px-3 py-2 rounded-xl border border-[var(--border)]" onClick={()=>apply(0)}>Default</button>
      <button type="button" className="px-3 py-2 rounded-xl border border-[var(--border)]" onClick={()=>apply(1)}>A+</button>
    </div>
  )
}
