'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted,setMounted]=useState(false)
  useEffect(()=>{setMounted(true)},[])
  const current = resolvedTheme || theme
  if(!mounted) return <button aria-label="Toggle theme" className="btn btn-secondary h-8 w-8 text-xs" title="Toggle theme">⋯</button>
  return (
    <button
      aria-pressed={current==='dark'}
      onClick={()=> setTheme(current==='dark' ? 'light' : 'dark')}
      className="h-8 w-8 rounded-full flex items-center justify-center border bg-white text-neutral-700 hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-colors"
      title="Toggle theme"
    >
      {current==='dark' ? '🌙' : '☀️'}
    </button>
  )
}
