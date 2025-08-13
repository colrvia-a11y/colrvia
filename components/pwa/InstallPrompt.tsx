'use client'
import { useEffect, useState } from 'react'

export default function InstallPrompt(){
  const [deferred, setDeferred] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  useEffect(()=>{
    const key='installDismissedAt'
    function handler(e: any){
      e.preventDefault()
      setDeferred(e)
      const last = localStorage.getItem(key)
      if(!last || Date.now() - parseInt(last,10) > 24*60*60*1000){
        setVisible(true)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)
    return ()=>window.removeEventListener('beforeinstallprompt', handler)
  },[])
  if(!visible) return null
  return (
    <div className="fixed bottom-4 left-4 bg-neutral-900 text-white text-sm px-4 py-3 rounded shadow-lg flex items-center gap-3">
      <span>Install Colrvia?</span>
  <button type="button" className="underline" onClick={async()=>{ if(deferred){ deferred.prompt(); const choice = await deferred.userChoice; } setVisible(false)}}>Install</button>
  <button type="button" aria-label="Dismiss" onClick={()=>{ localStorage.setItem('installDismissedAt', Date.now().toString()); setVisible(false)}} className="opacity-70 hover:opacity-100">×</button>
    </div>
  )
}
