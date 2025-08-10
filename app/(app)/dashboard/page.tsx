import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'

/**
 * Example protected dashboard page. Requires a signed-in user to view.
 * If no user is authenticated, it prompts the user to sign in.
 */
export default async function Dashboard() {
  const supabase = supabaseServer()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="p-8">
        <p className="mb-4">You must sign in to view your dashboard.</p>
        <Link className="underline" href="/">
          Go back
        </Link>
      </main>
    )
  }

  return (
    <main className="p-8">
      <h1 className="text-xl font-semibold mb-2">
        Welcome, {user.email}
      </h1>
      <p className="text-neutral-600">
        This is where palettes, uploads, and projects will live.
      </p>
    </main>
  )
}