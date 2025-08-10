"use client"
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface MotionContextValue { reduced: boolean; toggle: ()=>void; setReduced:(v:boolean)=>void }
const MotionContext = createContext<MotionContextValue | undefined>(undefined)

const KEY = 'colrvia-reduced-motion'

export function MotionProvider({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(false)
  useEffect(()=>{
    const stored = typeof window!=='undefined'? localStorage.getItem(KEY) : null
    if(stored==='true') setReduced(true)
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    function handle(){ if(!localStorage.getItem(KEY)) setReduced(mq.matches) }
    mq.addEventListener('change', handle)
    return ()=>mq.removeEventListener('change', handle)
  },[])
  function toggle(){ setReduced(r=>{ const next=!r; localStorage.setItem(KEY, String(next)); return next }) }
  function setReducedExplicit(v:boolean){ localStorage.setItem(KEY,String(v)); setReduced(v) }
  return <MotionContext.Provider value={{ reduced, toggle, setReduced: setReducedExplicit }}>{children}</MotionContext.Provider>
}

export function useMotion(){
  const ctx = useContext(MotionContext)
  if(!ctx) throw new Error('useMotion must be used within MotionProvider')
  return ctx
}

export function useReducedMotion(){
  return useMotion().reduced
}
