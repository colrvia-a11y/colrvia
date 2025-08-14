import React from 'react'

export default function Stepper({ step, total, percent }:{
  step: number; total: number; percent: number;
}) {
  return (
    <div className="rt-progress" aria-label={`Step ${step} of ${total}`}>
      <div className="rt-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="rt-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className="rt-step">Step {step} of {total}</span>
      <style jsx>{`
        .rt-progress { display:flex; align-items:center; gap: var(--space-3); margin: var(--space-4) 0; }
        .rt-bar { flex:1; height: 8px; background: var(--color-bg-inset); border-radius: var(--radius-pill); overflow: hidden; }
        .rt-fill { height: 100%; background: var(--brand); transition: width var(--dur-300) var(--ease-standard); }
        .rt-step { font: 600 var(--text-sm)/1 system-ui; color: var(--color-fg-muted); }
      `}</style>
    </div>
  )
}
