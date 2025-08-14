import React, { useEffect } from 'react'

type Props = {
  onBack: () => void
  onSkip?: () => void
  onContinue: () => void
  disableContinue: boolean
  canSkip: boolean
}

export default function StickyActions({ onBack, onSkip, onContinue, disableContinue, canSkip }: Props){
  useEffect(() => {
    function handler(e: KeyboardEvent){
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { onContinue() }
      if (e.key === 'Escape') { onBack() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onBack, onContinue])
  return (
    <div className="rt-sticky">
      <button type="button" className="rt-ghost" onClick={onBack}>← Back</button>
      {canSkip && <button type="button" className="rt-ghost" onClick={onSkip}>Skip</button>}
      <button type="button" className="rt-primary" disabled={disableContinue} onClick={onContinue}>Continue →</button>
      <style jsx>{`
        .rt-sticky { position: sticky; bottom: var(--space-4); display:flex; justify-content: flex-end; gap: var(--space-3); padding-top: var(--space-6); }
        .rt-primary { background: var(--brand); color: var(--brand-contrast); padding: var(--space-3) var(--space-4); border-radius: var(--radius-pill); border:none; }
        .rt-primary:disabled { opacity: .5; }
        .rt-ghost { background: transparent; border: none; color: var(--color-fg); padding: var(--space-3) var(--space-4); border-radius: var(--radius-pill); }
        .rt-ghost:focus-visible, .rt-primary:focus-visible { outline: none; box-shadow: var(--focus-ring); }
      `}</style>
    </div>
  )
}
