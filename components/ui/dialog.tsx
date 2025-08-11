"use client"
import * as React from 'react'

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> { open: boolean; onOpenChange: (v:boolean)=>void }
export function Dialog({ open, onOpenChange, children }: DialogProps){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=> onOpenChange(false)} />
      <div className="relative z-10 flex min-h-full items-start justify-center p-4 md:p-10">
        {children}
      </div>
    </div>
  )
}
export function DialogContent({ className='', children }: { className?: string; children: React.ReactNode }){
  return <div className={["w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] p-6 shadow-soft border", className].join(' ')}>{children}</div>
}
export function DialogHeader({ children }: { children: React.ReactNode }){ return <div className="mb-4 space-y-1">{children}</div> }
export function DialogTitle({ children }: { children: React.ReactNode }){ return <h2 className="text-xl font-semibold tracking-tight">{children}</h2> }
