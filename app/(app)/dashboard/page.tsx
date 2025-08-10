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
    <main className="mx-auto max-w-2xl p-6 space-y-8">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Projects</h1>
        <p className="text-sm text-neutral-600">Manage your projects</p>
      </header>

      <section className="space-y-4">
        {projects.length === 0 ? (
          <p className="text-sm text-neutral-500">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map(p => (
              <li key={p.id} className="rounded-2xl border p-4 hover:bg-neutral-50 transition">
                <Link href={`/project/${p.id}`} className="font-medium hover:underline underline-offset-2">{p.name}</Link>
                <div className="text-xs text-neutral-500 mt-0.5">{new Date(p.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <NewProjectForm />
      </section>
    </main>
  )
}