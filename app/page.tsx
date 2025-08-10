import Link from 'next/link'
import Button from '@/components/ui/Button'
import FadeIn from '@/components/motion/FadeIn'
import { useMotion } from '@/components/theme/MotionSettings'
import { Suspense } from 'react'

function MiniDemo(){
  const palette = [
    { name:'Foundation', hex:'#EDEAE4' },
    { name:'Primary', hex:'#2F5D50' },
    { name:'Accent', hex:'#C07A5A' },
    { name:'Lift', hex:'#F7BE58' },
    { name:'Depth', hex:'#2B3A38' }
  ]
  return (
    <div className="grid grid-cols-5 gap-3 mt-10 max-w-md">
      {palette.map(p=> (
        <div key={p.name} className="aspect-square rounded-2xl relative shadow-sm ring-1 ring-[var(--border)] overflow-hidden group">
          <div className="absolute inset-0" style={{background:p.hex}} />
          <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 text-[11px] font-medium tracking-wide bg-[color:rgba(30,27,22,.55)] backdrop-blur text-white flex items-center justify-between opacity-0 group-hover:opacity-100 transition">
            <span>{p.name}</span>
            <span>{p.hex}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Home(){
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(192,122,90,0.08),transparent),radial-gradient(circle_at_80%_70%,rgba(47,93,80,.10),transparent)]" aria-hidden />
      <section className="relative max-w-6xl mx-auto px-4 pt-24 pb-28">
        <div className="max-w-xl">
          <FadeIn delay={0.05}><div className="text-[11px] tracking-[0.25em] font-medium text-[var(--ink-subtle)] mb-5">INSTANT COLOR CONFIDENCE</div></FadeIn>
          <FadeIn delay={0.12}><h1 className="font-display text-5xl leading-[1.05]">From vibe to walls in minutes.</h1></FadeIn>
          <FadeIn delay={0.2}><p className="mt-6 text-lg text-[var(--ink-subtle)] max-w-md">Real paint codes. Clear placements. Confidence now.</p></FadeIn>
          <FadeIn delay={0.28}>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button as={Link} href="/start" variant="primary">Start a Color Story</Button>
              <Button as={Link} href="#demo" variant="secondary">See how it looks</Button>
            </div>
          </FadeIn>
        </div>
        <FadeIn delay={0.35}><MiniDemo /></FadeIn>
      </section>
      <section id="demo" className="relative max-w-6xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-10 mt-6">
          <div className="space-y-3">
            <h3 className="font-display text-xl">Designer brains</h3>
            <p className="text-sm text-[var(--ink-subtle)] leading-relaxed">Each Color Story starts with a curated designer perspective—balancing undertones, natural light, and livability.</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-xl">Adaptive palette engine</h3>
            <p className="text-sm text-[var(--ink-subtle)] leading-relaxed">Your vibe, brand, lighting, and materials shape a harmonious 60 / 30 / 10 story with softer & bolder variants.</p>
          </div>
          <div className="space-y-3">
            <h3 className="font-display text-xl">Ready to act</h3>
            <p className="text-sm text-[var(--ink-subtle)] leading-relaxed">Real paint codes, placements, share image, PDF export (Pro) — so you move from ideas to brush with confidence.</p>
          </div>
        </div>
      </section>
    </div>
  )
}