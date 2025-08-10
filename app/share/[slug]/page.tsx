import ColorSwatchCard from '@/components/ColorSwatchCard'

export const dynamic = 'force-dynamic'

async function fetchStory(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/share/${slug}`, { cache: 'no-store' })
    if (res.status === 404) return { notFound: true as const }
    if (!res.ok) return { error: true as const }
    const json = await res.json()
    return { data: json }
  } catch {
    return { error: true as const }
  }
}

export default async function PublicSharePage({ params }: { params: { slug: string } }) {
  const result = await fetchStory(params.slug)
  if ('notFound' in result) {
    return <main className="mx-auto max-w-2xl p-6">This Color Story is not public or was removed.</main>
  }
  if ('error' in result) {
    return <main className="mx-auto max-w-2xl p-6">Error loading story.</main>
  }

  const { data } = result
  const story = data.story || {}
  const palette = Array.isArray(story.palette) ? story.palette : []

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold mb-2">{story.title || data.name}</h1>
        <p className="text-sm text-neutral-500">{new Date(data.created_at).toLocaleString()}</p>
      </header>

      {palette.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {palette.map((c: any, i: number) => <ColorSwatchCard key={i} c={c} />)}
        </section>
      )}

      {story.narrative && (
        <section className="prose max-w-none text-neutral-800">
          <p>{story.narrative}</p>
        </section>
      )}

      <footer className="pt-4 text-sm text-neutral-500">
        <a href="/designers" className="underline">Create your own at /designers</a>
      </footer>
    </main>
  )
}
