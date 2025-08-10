import Link from 'next/link'
export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Dashboard (dev)</h1>
      <p className="text-neutral-600 mb-6">
        Auth is temporarily disabled on this page so we can keep building features.
      </p>
      <div className="space-x-2">
        <Link href="/" className="rounded-xl px-4 py-2 border inline-block">Home</Link>
        <Link href="/test-upload" className="rounded-xl px-4 py-2 border inline-block">Test upload</Link>
      </div>
    </main>
  )
}