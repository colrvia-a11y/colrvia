'use client'
import { useEffect, useState } from 'react'
import type { ColorStory, PaletteColor } from '@/types/colorStory'
import { motion, AnimatePresence } from 'framer-motion'

function Swatch({ c }: { c: PaletteColor }) {
  const [copied, setCopied] = useState(false)
  return (
    <motion.div
      layout
      initial={{opacity:0, y:12}}
      animate={{opacity:1, y:0}}
      whileHover={{ y:-4 }}
      transition={{ duration:.45 }}
      className="relative rounded-2xl border overflow-hidden group"
    >
      <div className="h-24 w-full" style={{ backgroundColor: c.hex }} />
      <div className="p-3 text-sm">
        <div className="font-medium">{c.name}</div>
        <div className="text-neutral-600">{c.hex} · {c.brand}</div>
        <div className="text-neutral-500 mt-1 text-xs">{c.placement}</div>
      </div>
      <button type="button"
        aria-label={`Copy ${c.hex}`}
        onClick={() => { navigator.clipboard.writeText(c.hex); setCopied(true); setTimeout(()=>setCopied(false), 1000) }}
        className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </motion.div>
  )
}

export default function StoryReveal() {
  const [story, setStory] = useState<ColorStory | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('colrvia:lastStory')
    if (raw) setStory(JSON.parse(raw))
  }, [])

  if (!story) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">No story yet</h1>
        <p className="text-neutral-600">Start with a designer to generate your color story.</p>
      </main>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.6}} className="eyebrow mb-3">COLRVIA</motion.div>
        <motion.h1 initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{duration:.6, delay:.1}} className="text-3xl font-semibold">{story.title}</motion.h1>
        <motion.p initial={{opacity:0}} animate={{opacity:.9}} transition={{duration:.6, delay:.2}} className="text-neutral-600 mt-2">{new Date(story.createdAt).toLocaleString()}</motion.p>
      </div>
      <motion.section
        initial="hidden"
        animate="show"
        variants={{ hidden:{}, show:{ transition:{ staggerChildren:.08, delayChildren:.15 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
      >
        {story.palette.map((c, i) => (
          <Swatch key={i} c={c} />
        ))}
      </motion.section>
      <AnimatePresence>
        <motion.section
          initial={{opacity:0, y:16}}
          animate={{opacity:1, y:0}}
          exit={{opacity:0}}
          transition={{duration:.7, delay:.4}}
          className="text-neutral-800 leading-relaxed"
        >
          <p>{story.narrative}</p>
        </motion.section>
      </AnimatePresence>
    </div>
  )
}
