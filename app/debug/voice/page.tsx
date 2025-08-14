'use client'

import { useState } from 'react'
import { isVoiceEnabled } from '@/lib/flags'

export default function VoiceDebug() {
  const [flag, setFlag] = useState<boolean | null>(null)
  const [tokenOk, setTokenOk] = useState<null | string>(null)
  const [micOk, setMicOk] = useState<null | string>(null)
  const [secure, setSecure] = useState<boolean>(typeof window !== 'undefined' ? window.isSecureContext : false)

  const checkFlag = () => setFlag(isVoiceEnabled())

  const checkToken = async () => {
    try {
      const res = await fetch('/api/realtime/session', { method: 'POST' })
      const txt = await res.text()
      if (!res.ok) return setTokenOk(`❌ ${res.status} ${txt.slice(0,200)}`)
      // very light validation to avoid showing secrets
      const hasSecret = /client_secret/.test(txt)
      setTokenOk(hasSecret ? '✅ session returned a client_secret shape' : '⚠️ 200 but no client_secret in JSON')
    } catch (e:any) {
      setTokenOk(`❌ ${e?.message || 'network error'}`)
    }
  }

  const checkMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicOk('✅ mic permission granted')
    } catch (e:any) {
      setMicOk(`❌ mic blocked: ${e?.name || e?.message || 'unknown'}`)
    }
  }

  const setOverride = (v:'on'|'off'|'clear') => {
    try {
      if (v === 'clear') localStorage.removeItem('voice')
      else localStorage.setItem('voice', v)
    } catch {}
    setFlag(null)
  }

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Voice Debug</h1>
      <div className="text-sm">
        <div>Secure Context: <b>{secure ? '✅ yes (HTTPS)' : '❌ no (needs HTTPS)'}</b></div>
        <div className="break-all">User Agent: <code>{typeof navigator !== 'undefined' ? navigator.userAgent : ''}</code></div>
        <div>Location: <code>{typeof location !== 'undefined' ? location.href : ''}</code></div>
      </div>

      <div className="space-x-2">
        <button type="button" className="px-3 py-2 rounded-xl bg-black text-white" onClick={checkFlag}>Check Voice Flag</button>
        {flag !== null && <span className="text-sm">{flag ? '✅ voice enabled' : '❌ voice disabled'}</span>}
      </div>

      <div className="space-x-2">
        <button type="button" className="px-3 py-2 rounded-xl bg-black text-white" onClick={checkToken}>Test Session Token</button>
        {tokenOk && <div className="text-sm mt-2">{tokenOk}</div>}
      </div>

      <div className="space-x-2">
        <button type="button" className="px-3 py-2 rounded-xl bg-black text-white" onClick={checkMic}>Request Mic</button>
        {micOk && <div className="text-sm mt-2">{micOk}</div>}
      </div>

      <div className="space-x-2 text-sm">
        <button type="button" className="px-2 py-1 rounded border" onClick={()=>setOverride('on')}>Force ON (store)</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={()=>setOverride('off')}>Force OFF (store)</button>
        <button type="button" className="px-2 py-1 rounded border" onClick={()=>setOverride('clear')}>Clear Override</button>
        <span className="opacity-70">Use ?voice=on|off to override via URL</span>
      </div>
    </div>
  )
}
