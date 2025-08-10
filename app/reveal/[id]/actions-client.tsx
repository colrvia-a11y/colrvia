"use client"
import { track } from '@/lib/analytics'
import { useReducedMotion } from '@/components/theme/MotionSettings'

interface ActionsProps { storyId: string; palette: Array<{ brand:string; name:string; code:string; hex:string; role:string }>; }
export default function ActionsClient({ storyId, palette }: ActionsProps){
  const reduce = useReducedMotion();
  function copyAll(){
    const lines = palette.map(p=>`${p.brand} — ${p.name} (${p.code}) ${p.hex} [${p.role}]`).join('\n')
    navigator.clipboard.writeText(lines)
  }
  function openShare(){
    const v = new URLSearchParams(window.location.search).get('v');
    const url = `/api/share/${storyId}/image${v?`?variant=${v}`:''}`;
    track('share_image_download',{ id:storyId, variant:v||'recommended' });
    window.open(url,'_blank');
  }
  return (
    <div className="flex gap-3 pt-4 flex-wrap">
      <button onClick={copyAll} className="btn btn-primary">Copy all codes</button>
      <button onClick={openShare} className="btn btn-secondary">Share Image</button>
    </div>
  )
}
