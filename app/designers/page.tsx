import { DESIGNERS } from '@/data/designers'
import Section from '@/components/ui/Section'
import Stagger, { Item } from '@/components/motion/Stagger'
import Link from 'next/link'

export default function DesignersPage() {
  return (
    <Section eyebrow="CHOOSE A DESIGNER" title="Pick your vibe" subtitle="Each brings a distinct aesthetic.">
      <Stagger>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESIGNERS.map(d => {
            const first = d.name.split(' ')[0]
            return (
              <Item key={d.id}>
                <div className="card p-5 h-full flex flex-col transition hover:shadow-lg hover:-translate-y-0.5">
                  <div className="font-semibold text-lg mb-1">{d.name}</div>
                  <div className="text-neutral-600 text-sm">{d.tagline}</div>
                  <div className="text-neutral-500 text-xs mt-3 flex-1">{d.style}</div>
                  <Link href={`/start?designer=${d.id}`} className="btn btn-secondary mt-4 text-center">Choose {first}</Link>
                </div>
              </Item>
            )
          })}
        </div>
      </Stagger>
    </Section>
  )
}
