"use client"
import { useRef } from 'react'
import clsx from 'clsx'

interface HorizontalCarouselProps {
  children: React.ReactNode
  className?: string
}

export default function HorizontalCarousel({ children, className='' }: HorizontalCarouselProps){
  const ref = useRef<HTMLDivElement|null>(null)
  function scroll(dir:number){
    const el = ref.current; if(!el) return
    el.scrollBy({ left: dir * (el.clientWidth*0.6), behavior:'smooth' })
  }
  return (
    <div className={clsx('relative', className)}>
      <div ref={ref} className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pr-2" style={{scrollBehavior:'smooth'}}>
        {children}
      </div>
      <div className="hidden md:flex absolute inset-y-0 left-0 items-center">
        <button aria-label="Scroll left" onClick={()=>scroll(-1)} className="h-9 w-9 rounded-full bg-white/80 backdrop-blur border border-[var(--border)] shadow-soft hover:bg-white transition" >‹</button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-0 items-center">
        <button aria-label="Scroll right" onClick={()=>scroll(1)} className="h-9 w-9 rounded-full bg-white/80 backdrop-blur border border-[var(--border)] shadow-soft hover:bg-white transition" >›</button>
      </div>
    </div>
  )
}
