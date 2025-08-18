'use client'
import { useRef } from 'react'
export function Composer({ onSend }:{ onSend:(t:string)=>void }){
  const ref = useRef<HTMLTextAreaElement>(null)
  function submit(e:React.FormEvent){ e.preventDefault(); const t=ref.current?.value.trim(); if(t){ onSend(t); if(ref.current) ref.current.value='' } }
  return (
    <form onSubmit={submit} className="sticky bottom-0 inset-x-0 bg-[var(--paper)]/95 backdrop-blur-sm border-t border-[var(--border)] p-2">
      <div className="flex items-end gap-2">
        <textarea ref={ref} rows={1} placeholder="Type a message…" className="flex-1 resize-none rounded-2xl bg-[var(--surface)] px-3 py-2 outline-none" />
        <button type="submit" className="h-10 w-10 rounded-full bg-[var(--accent)] text-[var(--accent-ink)] grid place-items-center">➤</button>
      </div>
    </form>
  )
}

