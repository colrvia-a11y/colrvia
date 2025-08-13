"use client"

import { useState } from 'react'

/**
 * Button that initiates a Stripe Checkout session by calling the
 * `/api/checkout` endpoint. Expects a `priceId` prop containing the
 * Stripe price identifier for the subscription or payment.
 */
export function SubscribeButton({ priceId }: { priceId: string }) {
  const [busy, setBusy] = useState(false)

  const go = async () => {
    setBusy(true)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId })
    })
    if (!res.ok) {
      alert('Failed to create checkout session')
      setBusy(false)
      return
    }
    const { url } = await res.json()
    location.href = url
  }

  return (
    <button type="button"
      onClick={go}
      disabled={busy}
      className="rounded-2xl px-4 py-2 bg-black text-white"
    >
      Subscribe
    </button>
  )
}