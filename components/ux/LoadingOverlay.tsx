"use client"
import { motion } from 'framer-motion'

export default function LoadingOverlay({ text = 'Mixing paints…' }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--bg)]/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
        className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 shadow-lg"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand/70 [animation-delay:120ms]" />
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand/40 [animation-delay:240ms]" />
          <span className="font-medium">{text}</span>
        </div>
      </motion.div>
    </div>
  )
}
