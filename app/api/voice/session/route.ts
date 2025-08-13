export async function POST() {
  const sessionId = 'demo-session'
  const sttUrl = '/voice/stt'
  const ttsUrl = '/voice/tts'
  return Response.json({ sessionId, sttUrl, ttsUrl })
}
