"use client"
import { useState } from "react"

export function UpgradeButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false)
  const go = async () => {
    try {
      setBusy(true)
      const res = await fetch('/api/checkout', { method: 'POST' })
      if (res.status === 401) {
        window.location.href = '/sign-in?next=' + encodeURIComponent(window.location.pathname)
        return
      }
      const json = await res.json()
      if (json?.url) window.location.href = json.url
      else alert('Unable to start checkout.')
    } catch (e) {
      console.error(e)
      alert('Checkout error')
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" onClick={go} disabled={busy} className={className || 'btn btn-primary'}>
      {busy ? 'Redirecting…' : 'Upgrade to Pro'}
    </button>
  )
}

