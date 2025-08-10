import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Upload } from '@/components/upload'

interface ProjectPageProps {
  params: { id: string }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="p-8 space-y-4">
        <p>You must sign in to view this project.</p>
        <Link className="underline" href="/sign-in">Sign in</Link>
      </main>
    )
  }

  // Fetch the project ensuring ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (projectError || !project) {
    return (
      <main className="p-8 space-y-4">
        <p>Not found</p>
        <Link href="/dashboard" className="underline">Back to dashboard</Link>
      </main>
    )
  }

  // Fetch images for this project via API route
  let images: { id: string; storage_path: string; created_at: string }[] = []
  try {
    const res = await fetch(`/api/projects/${project.id}/images`, { cache: 'no-store' })
    if (res.ok) images = await res.json()
  } catch (e) {
    // ignore fetch errors, keep images empty
  }

  // Build public URLs for each storage path
  const imagesWithUrls = images.map(img => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(img.storage_path)
    return { ...img, publicUrl: data.publicUrl }
  })

  return (
  <main className="mx-auto max-w-2xl p-6 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <Link href="/dashboard" className="text-sm underline text-neutral-600">Back to dashboard</Link>
      </header>

      <section className="space-y-4">
        <h2 className="font-medium">Upload Image</h2>
        <Upload projectId={project.id} />
      </section>

      <section className="space-y-4">
        <h2 className="font-medium">Images</h2>
        {imagesWithUrls.length === 0 ? (
          <p className="text-sm text-neutral-500">No images yet. Upload one above.</p>
        ) : (
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagesWithUrls.map(img => (
        <li key={img.id} className="rounded-2xl border p-0 overflow-hidden bg-white hover:bg-neutral-50 transition">
                <a href={img.publicUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={img.publicUrl}
                    alt="Project image"
                    className="w-full h-40 object-cover"
                  />
                </a>
                <div className="p-1 text-[10px] text-neutral-500 text-right">
                  {new Date(img.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
