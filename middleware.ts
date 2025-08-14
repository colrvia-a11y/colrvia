import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/start/processing') {
    const url = req.nextUrl.clone()
    const id = url.searchParams.get('id')
    if (id) {
      url.pathname = `/reveal/${id}`
      url.searchParams.set('optimistic', '1')
    } else {
      url.pathname = '/start/interview'
      url.search = '' // clear any old params
    }
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/start/processing'],
}
