"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { track } from '@/lib/analytics'

type Ctx = { start: (href: string) => Promise<void> }
const PortalCtx = createContext<Ctx | null>(null)

function useReducedMotionPref(){
  const [reduced, setReduced] = useState(true)
  useEffect(()=>{
    if(typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = (e:MediaQueryListEvent)=> setReduced(e.matches)
    mq.addEventListener?.('change', on)
    return ()=> mq.removeEventListener?.('change', on)
  },[])
  return reduced
}

export function StartStoryPortalProvider({ children }: { children: React.ReactNode }){
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [textIdx, setTextIdx] = useState(0)
  const reduced = useReducedMotionPref()
  const t0 = useRef<number>(0)
  const lines = useMemo(()=>[
    'Getting your designers ready…',
    'Blending your vibe…',
    'Fetching real paint codes…'
  ],[])

  useEffect(()=>{
    if(!active) return
    const id = setInterval(()=> setTextIdx(i=> (i+1)%lines.length),700)
    return ()=> clearInterval(id)
  },[active, lines.length])

  const start = useCallback(async (href: string)=>{
    if(reduced){ track('start_portal_open',{ href, skipped:true }); router.push(href); return }
    try {
      t0.current = Date.now()
      setTextIdx(0); setActive(true)
      try { track('start_portal_open', { href }) } catch {}
      if(typeof window !== 'undefined'){
        if('requestIdleCallback' in window){
          ;(window as any).requestIdleCallback(()=>{ try { (router as any).prefetch?.(href) } catch {} })
        } else {
          setTimeout(()=>{ try { (router as any).prefetch?.(href) } catch {} },0)
        }
      }
      await new Promise(r=> setTimeout(r,520))
      try { track('start_portal_nav', { href, ms: Date.now()-t0.current }) } catch {}
      router.push(href)
    } finally {
      setTimeout(()=> setActive(false), 480)
    }
  },[reduced, router])

  return (
    <PortalCtx.Provider value={{ start }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="portal"
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit={{ opacity:0, transition:{ duration:0.18 } }}
            className="fixed inset-0 z-[70] overflow-hidden bg-[var(--bg-surface)]/60 backdrop-blur-sm"
            aria-hidden
          >
            <motion.div
              initial={{ scale:0.6, opacity:0.5 }}
              animate={{ scale:2.2, opacity:0.9, transition:{ duration:0.5, ease:'easeOut' } }}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full"
              style={{ background:'radial-gradient(closest-side, var(--brand-glow, rgba(255,125,64,0.40)), transparent 70%)' }}
            />
            <div className="pointer-events-none absolute inset-0">
              {Array.from({ length:14 }).map((_,i)=>(
                <motion.span
                  key={i}
                  className="absolute h-4 w-10 rounded-full"
                  style={{ backgroundColor:'var(--brand)', left:`${(i*7)%100}%`, top:`${(i*13)%100}%`, opacity:0.8 }}
                  initial={{ x:-20, y:10, rotate:-8, opacity:0 }}
                  animate={{ x:140, y:-6, rotate:4, opacity:1, transition:{ duration:0.6, delay:i*0.02 } }}
                />
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-[22%] grid place-items-center">
              <motion.div
                initial={{ y:12, opacity:0 }}
                animate={{ y:0, opacity:1, transition:{ duration:0.24 } }}
                className="rounded-full border bg-[var(--bg-surface)]/90 px-4 py-2 text-sm shadow"
              >
                {lines[textIdx]}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalCtx.Provider>
  )
}

export function useStartStory(){
  const ctx = useContext(PortalCtx)
  if(!ctx) throw new Error('useStartStory must be used within StartStoryPortalProvider')
  return ctx.start
}
