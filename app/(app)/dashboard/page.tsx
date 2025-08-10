import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase/server'
import NewProjectForm from './new-project-form'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
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

  let projects: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/projects`, { cache: 'no-store' })
    if (res.ok) projects = await res.json()
  } catch {}

  return (
    <main className="container-xy py-10 space-y-12 max-w-3xl">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-1">Projects</h1>
          <p className="text-sm text-neutral-600">Manage your saved color stories & uploads</p>
        </div>
        <a href="/designers" className="btn btn-primary">New Color Story</a>
      </header>

      {projects.length === 0 ? (
        <div className="card p-10 text-center space-y-4">
          <h2 className="text-xl font-medium">No projects yet</h2>
            <p className="text-neutral-600 text-sm max-w-sm mx-auto">Create your first project to start organizing images and saving color stories you love.</p>
            <div className="flex justify-center"><NewProjectForm /></div>
        </div>
      ) : (
        <div className="space-y-6">
          <ul className="divide-y rounded-2xl border overflow-hidden bg-white">
            {projects.map(p => (
              <li key={p.id}>
                <Link href={`/project/${p.id}`} className="flex items-center justify-between px-5 py-4 group hover:bg-neutral-50 transition">
                  <div>
                    <div className="font-medium group-hover:underline">{p.name}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <span aria-hidden className="text-neutral-400 group-hover:text-neutral-600 transition">›</span>
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <h3 className="font-medium mb-2">Create another</h3>
            <NewProjectForm />
          </div>
        </div>
      )}

      <div className="text-xs text-neutral-500">Developer tools: <Link href="/test-upload" className="underline">Test upload</Link></div>
    </main>
  )
}