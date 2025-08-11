import Link from 'next/link'
import BillingSoonNotice from './BillingSoonNotice'
import { DEFAULT_DESIGNER_ID } from '@/lib/ai/designers'

export default function StartPage(){
  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <BillingSoonNotice />
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Start</h1>
        <p className="text-sm text-[var(--color-fg-muted)] max-w-md">We’ll guide you with our default designer. You can explore other voices later.</p>
      </header>
      <Link href={`/preferences/${DEFAULT_DESIGNER_ID}`} className="btn btn-primary w-full sm:w-auto">Get my palette</Link>
      <p className="text-xs text-[var(--ink-subtle)]">Want to meet all designers? <Link href="/designers" className="underline">See them here</Link>.</p>
    </main>
  )
}
