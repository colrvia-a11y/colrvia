"use client"
import React from 'react'
import { track } from '@/lib/analytics'

interface ActionBarProps { storyId:string; palette: Array<{ brand:string; name:string; code:string; hex:string; role:string }> }

export default function StoryActionBar({ storyId, palette }: ActionBarProps){
  function copyAll(){
    const lines = palette.map(p=>`${p.brand} — ${p.name} (${p.code}) ${p.hex} [${p.role}]`).join('\n')
    navigator.clipboard.writeText(lines)
    window.dispatchEvent(new CustomEvent('swatch-copied',{ detail:{ name:'Palette', hex:'' }}))
  }
  function openShare(){
    const v = new URLSearchParams(window.location.search).get('v');
    const url = `/api/share/${storyId}/image${v?`?variant=${v}`:''}`;
    track('share_image_download',{ id:storyId, variant:v||'recommended' });
    window.open(url,'_blank');
  }
  return (
    <div className="flex gap-3 pt-6 flex-wrap">
  <button onClick={copyAll} className="btn btn-primary">Copy palette codes</button>
  <button onClick={openShare} className="btn btn-secondary">Open share image</button>
    </div>
  )
}
