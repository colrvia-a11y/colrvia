import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl
  const host = req.headers.get('host')

  // Only enforce in production to keep local + previews flexible
  if (process.env.NODE_ENV === 'production') {
    if (host === 'www.colrvia.com') {
      url.hostname = 'colrvia.com'
      return NextResponse.redirect(url, 308)
    }
    // Optional: if you never want the vercel.app domain live as prod,
    // uncomment below to force canonical in production:
    // if (host?.endsWith('.vercel.app')) {
    //   url.hostname = 'colrvia.com'
    //   return NextResponse.redirect(url, 308)
    // }
  }

  return NextResponse.next()
}

// Exclude Next assets; keep API & app routes included
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
