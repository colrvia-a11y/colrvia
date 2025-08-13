'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import type { DesignerProfile } from '@/types/colorStory'

export default function DesignerCard({ d }: { d: DesignerProfile }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className="rounded-2xl border p-4">
      <div className="text-lg font-semibold">{d.name}</div>
      <div className="text-neutral-600">{d.tagline}</div>
      <div className="text-neutral-500 text-sm mt-2">{d.style}</div>
      <Link
        href={`/preferences/${d.id}`}
        className="inline-block mt-4 rounded-xl px-4 py-2 bg-black text-white"
      >
        Choose {d.name.split(' ')[0]}
      </Link>
    </motion.div>
  )
}
