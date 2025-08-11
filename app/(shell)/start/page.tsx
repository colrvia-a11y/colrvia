import Link from 'next/link'
import BillingSoonNotice from './BillingSoonNotice'

export default function StartPage(){
  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <BillingSoonNotice />
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">Start</h1>
	<p className="text-sm text-[var(--color-fg-muted)] max-w-md">Choose a designer to begin your preferences interview.</p>
      </header>
      <Link href="/designers" className="btn btn-primary w-full sm:w-auto">Choose your designer</Link>
    </main>
  )
}
