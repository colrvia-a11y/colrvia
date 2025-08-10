'use client'
import { motion } from 'framer-motion'
export default function Stagger({ children, delay=0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden:{}, show:{ transition:{ staggerChildren:.08, delayChildren:delay } } }}>
      {children}
    </motion.div>
  )
}
export function Item({ children }: { children: React.ReactNode }) {
  return <motion.div variants={{ hidden:{opacity:0, y:10}, show:{opacity:1, y:0} }}>{children}</motion.div>
}
