import { NextResponse } from 'next/server'
import sw from '@/data/brands/sw.json'
import behr from '@/data/brands/behr.json'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json({ brands: { SW: (sw as any[]).length, Behr: (behr as any[]).length } })
}
