'use client'
import { useEffect, useState } from 'react'
export default function PWABadge(){
  const [state,setState]=useState<'checking'|'installable'|'standalone'|'browser'>('checking')
  useEffect(()=>{
    const isStandalone = (window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone
    if(isStandalone) { setState('standalone'); return }
    const installable = 'BeforeInstallPromptEvent' in window
    setState(installable?'installable':'browser')
  },[])
  if(state==='checking') return null
  return <div className="text-[11px] text-neutral-500">PWA: {state==='standalone'? 'Installed ✓':'Installable ✓'}</div>
}
