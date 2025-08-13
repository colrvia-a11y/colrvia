"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function MorePage(){
  const router = useRouter()
  async function logout(){
    try { await supabaseBrowser().auth.signOut() } catch {}
    router.push('/home')
  }
  const items = [
    { href:'/account', label:'Account'},
    { href:'/billing', label:'Billing'},
    { href:'/support', label:'Support'},
    { href:'/legal', label:'Legal'},
    { href:'/feedback', label:'Feedback'},
  ]
  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="font-display text-4xl leading-[1.05] mb-4">More</h1>
  <p className="text-sm text-muted-foreground">Profile, plan, help, and feedback.</p>
      </header>
      <ul className="divide-y rounded-2xl border bg-[var(--bg-surface)]">
        {items.map(i=> (
          <li key={i.href}>
            <Link href={i.href} className="flex items-center justify-between px-5 py-4 hover:bg-[var(--linen)]/60">
              <span>{i.label}</span>
              <span aria-hidden className="text-xs text-muted-foreground">›</span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" onClick={logout} className="w-full text-left px-5 py-4 hover:bg-[var(--linen)]/60">Log out</button>
        </li>
      </ul>
  <div className="text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Colrvia</div>
    </main>
  )
}
