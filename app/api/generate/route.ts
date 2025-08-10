import { NextRequest, NextResponse } from 'next/server'
import { SAMPLE_STORIES } from '@/data/sampleStories'

export async function POST(req: NextRequest) {
  const { designer } = await req.json()
  const d = (designer || 'emily') as 'emily'|'zane'|'marisol'
  const list = SAMPLE_STORIES[d]
  const story = list[Math.floor(Math.random() * list.length)]
  return NextResponse.json({ ok: true, story })
}
