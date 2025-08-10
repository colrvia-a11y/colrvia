'use client'
import { useRef } from 'react'
export default function MagneticHover({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      onMouseMove={(e)=> {
        const el = ref.current; if(!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width/2) * .04
        const y = (e.clientY - rect.top - rect.height/2) * .04
        el.style.transform = `translate(${x}px, ${y}px)`
      }}
      onMouseLeave={() => { const el = ref.current; if(el) el.style.transform='translate(0,0)' }}
      className="transition-transform will-change-transform"
    >
      {children}
    </div>
  )
}
