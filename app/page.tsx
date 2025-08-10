import Link from 'next/link'
import FadeIn from '@/components/motion/FadeIn'
import Stagger, { Item } from '@/components/motion/Stagger'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function Home() {
  return (
    <div>
      <section className="container-xy pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <FadeIn delay={0.05}><div className="eyebrow mb-4">COLRVIA</div></FadeIn>
            <FadeIn delay={0.1}><h1 className="text-4xl sm:text-5xl font-semibold leading-tight">Design your color story</h1></FadeIn>
            <FadeIn delay={0.18}><p className="text-neutral-600 mt-6 text-lg max-w-lg">Personalized paint palettes shaped by your space, lighting, mood, and aesthetic preferences—crafted in seconds.</p></FadeIn>
            <FadeIn delay={0.26}>
              <div className="mt-8 flex gap-4">
                <Button as={Link} href="/designers">Get started</Button>
                <Button as={Link} variant="secondary" href="/sign-in">Sign in</Button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="card h-80 lg:h-96 grid place-items-center text-neutral-400 text-sm">
              <span>illustration / preview coming soon</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="container-xy pb-24">
        <Stagger delay={0.1}>
          <div className="grid md:grid-cols-3 gap-6">
            <Item>
              <Card className="p-6 h-full flex flex-col">
                <h3 className="font-medium text-lg mb-2">Smart Uploads</h3>
                <p className="text-sm text-neutral-600 flex-1">Bring in photos of your space to ground palette choices in real context.</p>
                <Link href="/dashboard" className="text-sm mt-4 underline">Try uploads →</Link>
              </Card>
            </Item>
            <Item>
              <Card className="p-6 h-full flex flex-col">
                <h3 className="font-medium text-lg mb-2">Palette Intelligence</h3>
                <p className="text-sm text-neutral-600 flex-1">Designer vibes plus adaptive logic shape harmonious, livable color stories.</p>
                <Link href="/designers" className="text-sm mt-4 underline">Pick a designer →</Link>
              </Card>
            </Item>
            <Item>
              <Card className="p-6 h-full flex flex-col">
                <h3 className="font-medium text-lg mb-2">Share & Export</h3>
                <p className="text-sm text-neutral-600 flex-1">Save stories to projects, iterate, and prepare paint specs to take with you.</p>
                <Link href="/reveal" className="text-sm mt-4 underline">View a story →</Link>
              </Card>
            </Item>
          </div>
        </Stagger>
      </section>
    </div>
  )
}