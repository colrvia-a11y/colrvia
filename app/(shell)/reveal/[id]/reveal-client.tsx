'use client'
import { useState } from 'react'
import Cinematic from '@/components/reveal/Cinematic'

export default function RevealClient({ story }:{ story:{ id:string; title:string; narrative:string; palette:any[]; placements:any }}){
  const [open,setOpen]=useState(false)
  return (
    <>
  <button type="button" onClick={()=>setOpen(true)} className="btn btn-secondary text-xs">Play Reveal</button>
      <Cinematic open={open} onExit={()=>setOpen(false)} story={story} />
    </>
  )
}
