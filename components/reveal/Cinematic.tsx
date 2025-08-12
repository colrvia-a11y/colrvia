"use client"
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { useReducedMotion } from '@/components/theme/MotionSettings'
import { track, initAnalytics } from '@/lib/analytics'

interface CinematicProps { open:boolean; onExit:()=>void; story:{ id:string; title:string; palette:any[]; narrative:string; placements:any; }; }
export default function Cinematic({ open, onExit, story }: CinematicProps){
  const startRef = useRef<number| null>(null)
  const [elapsed,setElapsed]=useState(0)
  useEffect(()=>{ initAnalytics() },[])
  useEffect(()=>{
    if(open){ startRef.current=performance.now(); track('cinematic_play',{ id:story.id }) }
    const t = setInterval(()=>{ if(startRef.current) setElapsed((performance.now()-startRef.current)/1000) },500)
    return ()=>clearInterval(t)
  },[open, story.id])
  const end = useCallback(()=>{ track('cinematic_exit',{ id:story.id, seconds:Number(elapsed.toFixed(1)) }); onExit() },[elapsed, onExit, story.id])
  const palette = story.palette || []
  const reduce = useReducedMotion()
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) end() }}>
      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] bg-neutral-900"
                >
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent,rgba(0,0,0,0.6))]" />
                </motion.div>
              </Dialog.Overlay>
              <Dialog.Content
                asChild
                role="dialog"
                aria-modal="true"
                aria-label="Palette reveal cinematic"
                className="fixed inset-0 z-[101] flex flex-col p-8 md:p-16 gap-12 overflow-hidden text-neutral-50"
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-12 h-full">
                  <Dialog.Title asChild>
                    <motion.h1
                      initial={reduce ? undefined : { opacity: 0, y: 20 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: reduce ? 0 : 0.6, ease: 'easeOut' }}
                      className="text-4xl md:text-6xl font-semibold tracking-tight max-w-3xl leading-tight"
                    >
                      {story.title}
                    </motion.h1>
                  </Dialog.Title>
                  <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 flex-1 items-start content-start"
                    initial={reduce ? undefined : 'hidden'}
                    animate={reduce ? undefined : 'show'}
                    variants={reduce ? undefined : { hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
                  >
                    {palette.map((p: any, i: number) => (
                      <motion.div
                        key={i}
                        variants={reduce ? undefined : { hidden: { opacity: 0, y: -10 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="rounded-3xl overflow-hidden border border-white/10 backdrop-blur bg-white/5 focus-within:ring-2 ring-white/40"
                      >
                        <div className="h-40 md:h-48" style={{ background: p.hex }} />
                        <div className="p-4 text-xs uppercase tracking-wide opacity-80">{p.role}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                  <Dialog.Description asChild>
                    <motion.div
                      initial={reduce ? undefined : { opacity: 0, y: 30 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : 0.4, duration: 0.5 }}
                      className="max-w-2xl text-sm leading-relaxed text-neutral-200 space-y-3"
                    >
                      {story.narrative
                        .split(/\.\s+/)
                        .map((line, i) => (
                          <motion.p
                            key={i}
                            initial={reduce ? undefined : { opacity: 0 }}
                            animate={reduce ? undefined : { opacity: 1 }}
                            transition={reduce ? undefined : { delay: 0.5 + i * 0.25 }}
                          >
                            {line.trim()}
                          </motion.p>
                        ))}
                    </motion.div>
                  </Dialog.Description>
                  <div className="flex gap-4 pt-4">
                    <button
                      autoFocus
                      onClick={end}
                      className="px-5 py-2 rounded-full bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[.97] transition-transform"
                    >
                      Exit reveal (Esc)
                    </button>
                  </div>
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
