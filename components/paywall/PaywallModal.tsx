"use client"
import { useState } from 'react'

export function PaywallModal({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [busy, setBusy] = useState(false)
  async function upgrade() {
    setBusy(true)
    try {
      const res = await fetch('/api/checkout', { method:'POST' })
      const json = await res.json()
      if (json.url) window.location.href = json.url
      else alert('Unable to start checkout.')
    } catch (e) {
      console.error(e)
      alert('Checkout error')
    } finally { setBusy(false) }
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border">
        <div>
          <h2 className="text-xl font-semibold mb-1">Upgrade to Pro</h2>
          <p className="text-sm text-neutral-600">Unlimited saved Color Stories, PDF export & more coming soon.</p>
        </div>
        <ul className="text-sm space-y-2 list-disc pl-5">
          <li>Unlimited Color Stories (free includes 1)</li>
          <li>Beautiful PDF exports</li>
          <li>Priority features</li>
        </ul>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn btn-secondary flex-1">Close</button>
          <button onClick={upgrade} disabled={busy} className="btn btn-primary flex-1">{busy?'Redirect…':'Upgrade to Pro'}</button>
        </div>
        <p className="text-[11px] text-neutral-500">Secure Stripe checkout. Test mode.</p>
      </div>
    </div>
  )
}
