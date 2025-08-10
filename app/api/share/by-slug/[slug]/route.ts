import { NextResponse } from 'next/server'

// Projects public sharing has been retired. Provide a stable 410 response so
// old crawled links or bookmarks get a clear signal the resource is gone.
export async function GET() {
  return NextResponse.json({ error: 'Project sharing deprecated' }, { status: 410 })
}
