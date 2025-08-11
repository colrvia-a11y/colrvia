export const dynamic = 'force-dynamic'
export default function PublicSharePage() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Sharing by slug was removed</h1>
      <p className="text-sm text-[var(--ink-subtle)]">Older links may show this page. You can still share the reveal page directly.</p>
      <a className="btn btn-primary inline-flex" href="/start">Start a new Color Story</a>
    </main>
  )
}
