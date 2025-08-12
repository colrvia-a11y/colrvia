// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { captureException } from '@/lib/monitoring/sentry'

const billingOn =
  (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase() === 'true' ||
  process.env.NEXT_PUBLIC_FEATURE_BILLING === '1' ||
  (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase() === 'on'

export function middleware(req: NextRequest) {
  try {
    const { pathname, searchParams } = req.nextUrl
    const cookies = req.cookies
    const isBilling =
      pathname === '/billing' ||
      pathname.startsWith('/billing/') ||
      pathname === '/pricing' ||
      pathname.startsWith('/pricing/') ||
      pathname === '/subscribe' ||
      pathname.startsWith('/subscribe/')

    if (!billingOn && isBilling) {
      const url = req.nextUrl.clone()
      url.pathname = '/start'
      url.searchParams.set('billing', 'soon')
      if (!searchParams.has('from')) url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }

    // Protect dashboard routes: redirect unauthenticated users to sign-in with next param
    const dashboardPath = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
    if (dashboardPath) {
      const hasSbAccess =
        cookies.has('sb-access-token') ||
        cookies.has('sb:token') ||
        cookies.has('supabase-access-token')
      if (!hasSbAccess) {
        const url = req.nextUrl.clone()
        url.pathname = '/sign-in'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
    }

    return NextResponse.next()
  } catch (err) {
    captureException(err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/billing/:path*',
    '/pricing/:path*',
    '/subscribe/:path*',
    '/dashboard/:path*',
    '/api/:path*',
  ],
}
