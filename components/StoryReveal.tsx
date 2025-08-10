'use client'
import { useEffect, useState } from 'react'
import type { ColorStory } from '@/types/colorStory'
import ColorSwatchCard from '@/components/ColorSwatchCard'

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
    <main className="mx-auto max-w-3xl p-6">
      <div className="text-sm tracking-widest font-medium mb-3">COLRVIA</div>
      <h1 className="text-2xl font-semibold">{story.title}</h1>
      <p className="text-neutral-600 mt-2 mb-6">{new Date(story.createdAt).toLocaleString()}</p>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {story.palette.map((c, i) => <ColorSwatchCard key={i} c={c} />)}
      </section>

      <section className="prose max-w-none text-neutral-800">
        <p>{story.narrative}</p>
      </section>
    </main>
  )
}
