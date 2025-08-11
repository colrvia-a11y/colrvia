import { redirect } from 'next/navigation'

// Helper to enforce auth for server components / actions.
// If user missing redirect to sign-in preserving destination.
export function requireUser<T extends { user: any }>(session: T | null, nextPath: string){
  if(!session || !session.user){
    const qp = encodeURIComponent(nextPath || '/')
    redirect(`/sign-in?next=${qp}`)
  }
  return session.user
}

export function buildNextParam(url: string){
  try { return encodeURIComponent(url) } catch { return encodeURIComponent('/') }
}
