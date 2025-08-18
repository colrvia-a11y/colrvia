import { Empty } from '@/components/states/Empty'
export default function HomePage(){
  return (
    <div className="p-4 space-y-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">Welcome back 👋</h1>
        <div className="flex gap-2">
          <a className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white" href="/start/text-interview">Start Text Interview</a>
          <a className="px-3 py-2 rounded-xl border border-[var(--border)]" href="/start">Upload Room</a>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium mb-2">Recent palettes</h2>
        <Empty title="No palettes yet" action={<a className="px-3 py-2 rounded-xl border" href="/reveal">Browse samples</a>} />
      </section>
    </div>
  )
}
