'use client'
import { motion } from 'framer-motion'
import { useReducedMotion } from '@/components/theme/MotionSettings'
export default function FadeIn({ children, delay=0, as='div' }: any) {
  const reduce = useReducedMotion()
  const M = (motion as any)[as] || motion.div
  if (reduce) return <M>{children}</M>
  return <M initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:.5, delay}}>{children}</M>
}
