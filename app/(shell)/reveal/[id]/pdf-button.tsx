"use client"
import React, { useState } from 'react'
export default function PdfButton({ storyId }: { storyId:string }) {
  const [loading,setLoading]=useState(false)
  async function handle(){
    setLoading(true)
    try {
      const res = await fetch('/api/pdf',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ storyId }) })
      if(!res.ok){ alert('PDF error'); return }
      const blob = await res.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='colrvia-color-story.pdf'; a.click(); URL.revokeObjectURL(url)
    } finally { setLoading(false) }
  }
  return <button type="button" onClick={handle} className="btn btn-primary px-4 py-2 rounded-xl text-sm" disabled={loading}>{loading? 'Generating…':'Save PDF'}</button>
}
