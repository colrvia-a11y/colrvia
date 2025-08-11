"use client"
import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContextValue {
  titleId?: string
  setTitleId: (id: string) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [titleId, setTitleId] = React.useState<string>()
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContext.Provider value={{ titleId, setTitleId }}>
        {children}
      </DialogContext.Provider>
    </DialogPrimitive.Root>
  )
}

export function DialogContent({ className = '', children }: { className?: string; children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="fixed inset-0 z-50 flex min-h-full items-start justify-center p-4 md:p-10">
        <DialogPrimitive.Content
          aria-labelledby={ctx?.titleId}
          className={["w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] p-6 shadow-soft border", className].join(' ')}
        >
          {children}
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={["mb-4 space-y-1", className].join(' ')}>{children}</div>
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(DialogContext)
  const id = React.useId()
  React.useLayoutEffect(() => {
    ctx?.setTitleId(id)
  }, [ctx, id])
  return (
    <DialogPrimitive.Title id={id} className="text-xl font-semibold tracking-tight">
      {children}
    </DialogPrimitive.Title>
  )
}
