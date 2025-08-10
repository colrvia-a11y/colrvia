import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import NewProjectForm from './new-project-form'

export default async function Dashboard() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="p-8 space-y-4">
        <p>You must sign in to view your dashboard.</p>
        <Link href="/sign-in" className="underline">Sign in</Link>
      </main>
    )
  }

  // Server fetch projects via API route (ensures same auth context)
  let projects: any[] = []
  try {
    const res = await fetch('/api/projects', { cache: 'no-store' })
    if (res.ok) {
      projects = await res.json()
    }
  } catch {
    // ignore
  }

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-500">Welcome, {user.email}</p>
      </header>

      <section className="space-y-4">
        <h2 className="font-medium">Projects</h2>
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
        <div className="pt-2">
          <NewProjectForm />
        </div>
      </section>
    </main>
  )
}