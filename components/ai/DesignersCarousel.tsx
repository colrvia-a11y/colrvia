"use client"
import { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { designers } from '@/lib/ai/designers'
import { track } from '@/lib/analytics'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'

function useReducedMotionPref() {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const on = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduced
}

export default function DesignersCarousel(){
  const listRef = useRef<HTMLDivElement|null>(null)
  const reduced = useReducedMotionPref()
  const id = 'designers-carousel'
  const [active, setActive] = useState(0)
  function scrollByDir(dir:number){
    const el = listRef.current; if(!el) return
    const amount = Math.round(el.clientWidth * 0.8)
    el.scrollBy({ left: dir*amount, behavior:'smooth' })
  }

  const updateActive = useCallback(()=>{
    const el = listRef.current; if(!el) return
    const { left, width } = el.getBoundingClientRect()
    const center = left + width/2
    let best = 0, bestDist = Number.POSITIVE_INFINITY
    const cards = Array.from(el.querySelectorAll<HTMLElement>('[data-card-index]'))
    cards.forEach(card=>{
      const r = card.getBoundingClientRect();
      const cardCenter = r.left + r.width/2
      const dist = Math.abs(cardCenter - center)
      const idx = Number(card.dataset.cardIndex||'0')
      if(dist < bestDist){ bestDist = dist; best = idx }
    })
    setActive(best)
  },[])

  useEffect(()=>{
    updateActive()
    const el = listRef.current; if(!el) return
    const on = () => updateActive()
    el.addEventListener('scroll', on, { passive:true })
    window.addEventListener('resize', on)
    return ()=>{
      el.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  },[updateActive])
  return (
  <section aria-roledescription="carousel" aria-label="Available AI designers" className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[var(--bg-canvas)] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[var(--bg-canvas)] to-transparent z-10" />
      <div className="absolute inset-y-0 left-0 z-20 flex items-center">
  <button type="button" className="btn btn-secondary rounded-full shadow-sm h-10 w-10" aria-controls={id} aria-label="Previous" onClick={()=>scrollByDir(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center">
  <button type="button" className="btn btn-secondary rounded-full shadow-sm h-10 w-10" aria-controls={id} aria-label="Next" onClick={()=>scrollByDir(1)}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div id={id} ref={listRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-pl-4 -mx-4 px-4">
        {designers.map((d, idx)=>{
          return (
            <div key={d.id} className="snap-center relative min-w-[85%] md:min-w-[480px] lg:min-w-[540px]" data-card-index={idx}>
              <motion.div initial={reduced? false : { opacity:0, y:10, scale:0.98 }} whileInView={reduced? {} : { opacity:1, y:0, scale:1 }} viewport={{ once:true, amount:0.6 }} transition={{ duration:0.28 }} className="rounded-3xl overflow-hidden border bg-[var(--bg-surface)] shadow-sm">
                <div className="relative h-[420px] md:h-[480px]">
                  <Image src={d.heroImage} alt="" fill sizes="(max-width: 768px) 85vw, 540px" priority={idx===0} className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)]/70 via-[var(--bg-canvas)]/30 to-transparent" />
                  <div className="absolute inset-0 p-5 flex flex-col">
                    <div className="text-6xl mb-2 drop-shadow-sm" aria-hidden>{d.avatar}</div>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">{d.name}</h3>
                    <p className="text-sm md:text-base text-muted-foreground mt-1">{d.tagline}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{idx+1} / {designers.length}</div>
                      <Button
                        as={Link}
                        href={`/start/preferences?designerId=${d.id}`}
                        className="rounded-full"
                        onClick={()=> track('designer_select',{ designerId:d.id })}
                        aria-label={`Choose ${d.name}`}
                      >
                        Choose {d.short}
                      </Button>
                    </div>
                  </div>
                  <div className="absolute right-4 top-4 h-8 w-8 rounded-lg bg-[var(--bg-surface)]/60 backdrop-blur-sm border" aria-hidden />
                </div>
              </motion.div>
            </div>
          )
        })}
      </div>

    <div className="mt-4 flex items-center justify-center gap-2" aria-label="Slide position">
        {designers.map((_,i)=>(
      <button key={i} type="button" aria-label={`Go to slide ${i+1}`} aria-current={active===i? 'true':'false'} onClick={()=>{
            const el = listRef.current; if(!el) return
            const card = el.querySelector<HTMLElement>(`[data-card-index="${i}"]`)
            card?.scrollIntoView({ inline:'center', behavior:'smooth' })
      }} className={[ 'h-2 rounded-full transition-all', active===i? 'w-6 bg-[var(--ink)]':'w-2 bg-muted-foreground/40', 'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50' ].join(' ')} />
        ))}
      </div>
    </section>
  )
}
