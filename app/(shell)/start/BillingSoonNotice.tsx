"use client"

import { useSearchParams } from "next/navigation"

export default function BillingSoonNotice() {
  const sp = useSearchParams()
  if (sp.get("billing") !== "soon") return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-4 rounded-2xl border border-border bg-[hsl(var(--surface))] p-3 text-sm text-muted-foreground"
    >
      <strong className="mr-1 text-foreground">Billing is coming soon.</strong>
      You can try one free Color Story today.
    </div>
  )
}
