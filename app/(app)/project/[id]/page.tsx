import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import { Upload } from '@/components/upload'

function PaletteGenerator() {
  'use client'
  const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA']
  return (
    <div className="space-y-2 mt-6">
      <button
        onClick={() => { /* placeholder no-op */ }}
        className="rounded-xl px-4 py-2 border"
      >Generate Palette</button>
      <div className="flex gap-2">
        {colors.map(c => (
          <div key={c} className="h-10 w-10 rounded" style={{ background: c }} title={c} />
        ))}
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <p className="mb-4">You must sign in.</p>
        <Link href="/sign-in" className="rounded-xl px-4 py-2 border inline-block">Sign in</Link>
      </main>
    )
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    return <main className="mx-auto max-w-2xl p-6">Not found</main>
  }

  // Fetch images via API
  let images: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/projects/${params.id}/images`, { cache: 'no-store' })
    if (res.ok) images = await res.json()
  } catch {}

  const supabaseClient = supabaseServer()
  const storage = supabaseClient.storage.from('uploads')
  const withUrls = images.map(img => {
    const { data } = storage.getPublicUrl(img.storage_path)
    return { ...img, publicUrl: data.publicUrl }
  })

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
        <Link href="/dashboard" className="text-sm underline">Back to projects</Link>
      </header>

      <section className="space-y-3">
        <h2 className="font-medium">Upload image</h2>
        <Upload projectId={project.id} />
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Images</h2>
        {withUrls.length === 0 ? (
          <p className="text-sm text-neutral-500">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {withUrls.map(img => (
              <a key={img.id} href={img.publicUrl} target="_blank" className="block group">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={img.publicUrl}
                    alt="Uploaded"
                    className="h-full w-full object-cover group-hover:opacity-80 transition"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <PaletteGenerator />
    </main>
  )
}
