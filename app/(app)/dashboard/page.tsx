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
  let stories: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/projects`, { cache: 'no-store' })
    if (res.ok) projects = await res.json()
  } catch {}
  try {
    const supa = supabase
    const { data: s } = await supa.from('stories').select('id,title,brand,vibe,palette,created_at').order('created_at',{ ascending:false })
    stories = s || []
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Stories</h2>
          <Link href="/start" className="btn btn-primary">New Story</Link>
        </div>
        {stories.length === 0 ? (
          <div className="border rounded-2xl p-8 text-sm text-neutral-600">No stories yet. Generate your first one.</div>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-5">
            {stories.map(s => (
              <li key={s.id} className="rounded-2xl border overflow-hidden bg-white hover:shadow-sm transition">
                <Link href={`/reveal/${s.id}`} className="block p-4">
                  <div className="flex gap-1 mb-3">
                    {(s.palette||[]).slice(0,5).map((pc:any,i:number)=>(<span key={i} className="h-8 w-8 rounded-md border" style={{background:pc.hex}} />))}
                  </div>
                  <div className="font-medium mb-1 line-clamp-1">{s.title}</div>
                  <div className="text-xs text-neutral-500">{s.brand} · {s.vibe}</div>
                  <div className="text-[10px] text-neutral-400 mt-1">{new Date(s.created_at).toLocaleDateString()}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="text-xs text-neutral-500">Developer tools: <Link href="/test-upload" className="underline">Test upload</Link></div>
    </main>
  )
}