"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FirstRunWelcome(){
  const router = useRouter()
  useEffect(()=>{ document.title = 'Welcome · Colrvia' },[])
  function setDone(){ try { localStorage.setItem('firstRunComplete','1') } catch {} }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="font-display text-4xl leading-[1.05]">Design calmer, faster.</h1>
  <p className="text-sm text-muted-foreground">Turn a vibe into real paints with placement guidance. No account needed until you save.</p>
        <div className="space-y-3">
          <Link href="/start/interview-intro" onClick={setDone} className="btn btn-primary w-full">Start color story</Link>
          <Link href="/sign-in" onClick={()=>{ setDone(); }} className="btn btn-secondary w-full">Sign in</Link>
          <button type="button" onClick={()=>{ setDone(); router.push('/home') }} className="btn btn-ghost w-full">Skip for now</button>
        </div>
      </div>
    </main>
  )
}
