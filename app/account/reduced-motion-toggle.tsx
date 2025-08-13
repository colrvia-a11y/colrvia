'use client'
import { useMotion } from '@/components/theme/MotionSettings'

export default function ReducedMotionToggle(){
  const { reduced, toggle } = useMotion()
  return (
    <button type="button" onClick={toggle} className="text-sm px-3 py-1.5 rounded border bg-white/50 hover:bg-white transition">
      {reduced ? 'Reduced motion enabled' : 'Enable reduced motion'}
    </button>
  )
}
