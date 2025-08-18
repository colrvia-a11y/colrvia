'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import CommandPalette from './CommandPalette'

type Cmd = { id:string; label:string; run:()=>void; group:'Navigation'|'Actions' }
const Ctx = createContext<{ open:boolean; setOpen:(v:boolean)=>void; commands:Cmd[] }>({ open:false, setOpen:()=>{}, commands:[] })
export const useCommandPalette = () => useContext(Ctx)

export function CommandPaletteProvider({ children }:{ children:React.ReactNode }) {
  const [open,setOpen]=useState(false); const router=useRouter(); const pathname=usePathname()
  useEffect(()=>{ const onKey=(e:KeyboardEvent)=>{ if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setOpen(v=>!v) } }; window.addEventListener('keydown',onKey); return()=>window.removeEventListener('keydown',onKey) },[])
  useEffect(()=>{ setOpen(false) },[pathname])
  const commands:Cmd[] = useMemo(()=>[
    { id:'start', label:'Start Text Interview', group:'Actions', run:()=>router.push('/start/text-interview') },
    { id:'upload', label:'Upload Room Photos', group:'Actions', run:()=>router.push('/start') },
    { id:'palettes', label:'Explore Palettes', group:'Navigation', run:()=>router.push('/reveal') },
    { id:'prefs', label:'Preferences', group:'Navigation', run:()=>router.push('/preferences') },
  ],[router])
  return <Ctx.Provider value={{ open, setOpen, commands }}>{children}{open && <CommandPalette/>}</Ctx.Provider>
}
