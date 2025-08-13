import { isVoiceEnabled } from '@/lib/flags'

export async function POST() {
  if (!isVoiceEnabled()) {
    return new Response('Voice disabled', { status: 404 })
  }
  return Response.json({ sessionId: crypto.randomUUID() })
}
