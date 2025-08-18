'use client'
import { getSettings, onSettingsChange } from '@/lib/settings/store'
import { useEffect } from 'react'

export default function SettingsProvider({ children }:{ children:React.ReactNode }){
  useEffect(()=>{
    const apply=()=>{
      const { theme, accent, fontScale } = getSettings()
      const el=document.documentElement
      if (theme==='system') { el.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches) }
      else { el.classList.toggle('dark', theme==='dark') }
      if (accent) el.style.setProperty('--accent', accent)
      const scale = fontScale===-1?'0.95':fontScale===1?'1.05':'1'
      el.style.setProperty('--scale', scale)
    }
    apply()
    return onSettingsChange(apply)
  },[])
  return <>{children}</>
}
