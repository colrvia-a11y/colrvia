// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const billingOn =
  (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase() === 'true' ||
  process.env.NEXT_PUBLIC_FEATURE_BILLING === '1' ||
  (process.env.NEXT_PUBLIC_FEATURE_BILLING || '').toLowerCase() === 'on'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/billing/:path*', '/pricing/:path*', '/subscribe/:path*'],
}
