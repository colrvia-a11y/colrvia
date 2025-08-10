"use client"
import { useState } from 'react'
import { PaywallModal } from './paywall/PaywallModal'

export function RevealActions({ storyId, tier }: { storyId:string; tier:'free'|'pro' }) {
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  async function download() {
    if (tier !== 'pro') { setOpen(true); return }
    setDownloading(true)
    try {
      const res = await fetch('/api/pdf', { method:'POST', body: JSON.stringify({ storyId }), headers:{'Content-Type':'application/json'} })
      if (!res.ok) { alert('PDF error'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download='colrvia-color-story.pdf'; a.click(); URL.revokeObjectURL(url)
    } finally { setDownloading(false) }
  }
  return (
    <div className="flex gap-3 pt-4">
      <button onClick={download} className="btn btn-secondary" disabled={downloading}>{downloading?'Creating…':'Download PDF'}</button>
      <PaywallModal open={open} onClose={()=>setOpen(false)} />
    </div>
  )
}
