"use client"
import { useEffect, useState } from 'react'

interface CopyEventDetail { hex:string; name:string }

export default function CopyToast(){
  const [msg,setMsg]=useState<string | null>(null)
  useEffect(()=>{
    function handler(e:Event){
      const detail = (e as CustomEvent<CopyEventDetail>).detail
      setMsg(`${detail.name} ${detail.hex} copied`)
      const t = setTimeout(()=>setMsg(null), 1800)
      return ()=>clearTimeout(t)
    }
    window.addEventListener('swatch-copied', handler as any)
    return ()=>window.removeEventListener('swatch-copied', handler as any)
  },[])
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {msg && (
        <div className="px-4 py-2 rounded-full bg-[var(--ink)] text-white text-xs shadow-md/40 backdrop-blur-sm animate-fadeIn border border-[var(--border)]/20">
          {msg}
        </div>
      )}
    </div>
  )
}
