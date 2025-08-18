'use client'
import { useState } from 'react'

type Step = { id: string; title: string; element: React.ReactNode; validate?: () => boolean }

export function FormStepper({ steps, onFinish }:{ steps: Step[]; onFinish: () => void }) {
  const [i, setI] = useState(0)
  const step = steps[i]

  function next() {
    if (!step.validate || step.validate()) {
      setI(i + 1 >= steps.length ? (onFinish(), i) : i + 1)
    }
  }

  function back() {
    setI(Math.max(0, i - 1))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-sm">
        {steps.map((s, idx) => (
          <span
            key={s.id}
            className={`px-2 py-1 rounded ${idx === i ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-elev)]'}`}
          >
            {idx + 1}
          </span>
        ))}
      </div>
      <div>{step.element}</div>
      <div className="mt-4 flex gap-2">
        {i > 0 && (
          <button className="px-3 py-2 border rounded" onClick={back}>
            Back
          </button>
        )}
        <button className="px-3 py-2 bg-[var(--accent)] text-white rounded" onClick={next}>
          {i === steps.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  )
}
