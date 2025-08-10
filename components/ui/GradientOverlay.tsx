import React from 'react'

/** Bottom gradient overlay for media cards.
 * Rounds to 24px matching card radius. Accepts optional className.
 */
export default function GradientOverlay({ className='' }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-2xl overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(30,27,22,0.78)] via-[rgba(30,27,22,0.45)] to-transparent" />
    </div>
  )
}
