"use client"
import React from 'react'
export function PlacementIcon({ role, className }: { role:string; className?:string }) {
  const common = className || "w-4 h-4"
  switch(role){
    case 'walls': return <svg className={common} viewBox="0 0 24 24" aria-hidden><rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15"/><path d="M4 9h16M4 15h16" stroke="currentColor" strokeWidth="2"/></svg>
    case 'trim': return <svg className={common} viewBox="0 0 24 24" aria-hidden><rect x="5" y="5" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
    case 'cabinets': return <svg className={common} viewBox="0 0 24 24" aria-hidden><rect x="3" y="4" width="18" height="7" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="3" y="13" width="18" height="7" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="9" cy="7.5" r="1" fill="currentColor"/><circle cx="15" cy="16.5" r="1" fill="currentColor"/></svg>
    case 'accent': return <svg className={common} viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
    case 'ceiling': return <svg className={common} viewBox="0 0 24 24" aria-hidden><path d="M4 8l8-5 8 5v8l-8 5-8-5V8z" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
  }
  return null
}
