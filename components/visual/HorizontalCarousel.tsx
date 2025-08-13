"use client"
import React, { useRef, useId } from 'react'
import clsx from 'clsx'

interface HorizontalCarouselProps {
  children: React.ReactNode
  className?: string
  ariaLabel?: string
  describedBy?: string
}

export default function HorizontalCarousel({ children, className='', ariaLabel='Recommendations carousel', describedBy }: HorizontalCarouselProps){
  const ref = useRef<HTMLDivElement|null>(null)
  const instructionsId = useId()
  function scroll(dir:number){
    const el = ref.current; if(!el) return
    try {
      if(typeof (el as any).scrollBy === 'function'){
        el.scrollBy({ left: dir * (el.clientWidth*0.6), behavior:'smooth' })
      } else {
        el.scrollLeft += dir * (el.clientWidth*0.6)
      }
    } catch { /* noop for test env */ }
  }
  function handleKey(e:React.KeyboardEvent){
    if(['ArrowRight','ArrowLeft','Home','End','PageUp','PageDown'].includes(e.key)){
      e.preventDefault()
    }
    switch(e.key){
      case 'ArrowRight': scroll(1); break
      case 'ArrowLeft': scroll(-1); break
      case 'Home': {
        const el = ref.current; if(!el) break; try { if(typeof (el as any).scrollTo==='function') el.scrollTo({ left:0, behavior:'smooth'}); else el.scrollLeft=0; } catch { el.scrollLeft=0 }
        break
      }
      case 'End': {
        const el = ref.current; if(!el) break; try { if(typeof (el as any).scrollTo==='function') el.scrollTo({ left: el.scrollWidth, behavior:'smooth'}); else el.scrollLeft=el.scrollWidth; } catch { el.scrollLeft=el.scrollWidth }
        break
      }
      case 'PageDown': scroll(1.6); break
      case 'PageUp': scroll(-1.6); break
    }
  }
  return (
    <div className={clsx('relative', className)} role="region" aria-label={ariaLabel} aria-describedby={describedBy || instructionsId}>
      <p id={instructionsId} className="sr-only">Use Left/Right arrow keys to scroll recommendations. Home/End jump to start or end.</p>
      <div ref={ref} className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40" style={{scrollBehavior:'smooth'}} tabIndex={0} onKeyDown={handleKey}>
        {children}
      </div>
      <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
  <button type="button" aria-label="Scroll left" onClick={()=>scroll(-1)} className="h-9 w-9 rounded-full bg-white/80 backdrop-blur border border-[var(--border)] shadow-soft hover:bg-white transition" >‹</button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
  <button type="button" aria-label="Scroll right" onClick={()=>scroll(1)} className="h-9 w-9 rounded-full bg-white/80 backdrop-blur border border-[var(--border)] shadow-soft hover:bg-white transition" >›</button>
      </div>
    </div>
  )
}
