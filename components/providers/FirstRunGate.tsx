"use client"
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const EXEMPT_PREFIXES = ['/first-run','/share','/auth','/offline']

export default function FirstRunGate(){
  const pathname = usePathname() || '/'
  const router = useRouter()
  useEffect(()=>{
    if (typeof window === 'undefined') return
    const flag = localStorage.getItem('firstRunComplete') === '1'
    if (!flag) {
      const exempt = EXEMPT_PREFIXES.some(p=> pathname.startsWith(p))
      if (!exempt) router.replace('/first-run/welcome')
    }
  },[pathname, router])
  return null
}
