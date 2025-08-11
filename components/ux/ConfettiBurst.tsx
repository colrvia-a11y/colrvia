"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ConfettiBurst() {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setShow(false); return }
    const t = setTimeout(() => setShow(false), 600)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  const dots = Array.from({ length: 12 })
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center">
      {dots.map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ backgroundColor: 'hsl(var(--brand-hsl, var(--brand)))' }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / dots.length) * Math.PI * 2) * (40 + i * 2),
            y: Math.sin((i / dots.length) * Math.PI * 2) * (40 + i * 2),
            scale: 0.9
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
