'use client'
import { createContext, useContext, useState } from 'react'

type Toast = { id: number; text: string; kind?: 'success' | 'error' | 'info' }

const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void }>({ push: () => {} })

export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }:{ children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function push(t: Omit<Toast, 'id'>) {
    setToasts(v => [...v, { id: Date.now(), ...t }])
  }

  function remove(id: number) {
    setToasts(v => v.filter(t => t.id !== id))
  }

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[60]">
        {toasts.map(t => (
          <button
            key={t.id}
            type="button"
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow text-left"
            onClick={() => remove(t.id)}
          >
            {t.text}
          </button>
        ))}
      </div>
    </Ctx.Provider>
  )
}
