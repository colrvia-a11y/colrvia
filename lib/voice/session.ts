import { isVoiceEnabled } from '@/lib/flags'

let sessionId: string | null = null
let audioCtx: AudioContext | null = null
let speakSource: AudioBufferSourceNode | null = null

export async function startVoiceSession() {
  if (!isVoiceEnabled()) return
  try {
    const r = await fetch('/api/voice/session', { method: 'POST' })
    const data = await r.json().catch(() => ({})) as { sessionId?: string }
    sessionId = data.sessionId || null
  } catch (err) {
    console.error('startVoiceSession error', err)
  }
}

export async function speak(text?: string, opts: { ssml?: string } = {}) {
  if (!isVoiceEnabled() || !text) return
  audioCtx = audioCtx || new AudioContext()
  await stopSpeak()
  try {
    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: opts.ssml ?? text,
        voice: process.env.NEXT_PUBLIC_TTS_VOICE || 'alloy',
        ...(sessionId ? { session_id: sessionId } : {}),
      }),
    })
    const buf = await r.arrayBuffer()
    const audioBuf = await audioCtx.decodeAudioData(buf)
    const src = audioCtx.createBufferSource()
    src.buffer = audioBuf
    src.connect(audioCtx.destination)
    src.start(0)
    speakSource = src
  } catch (err) {
    console.error('speak error', err)
  }
}

export async function stopSpeak() {
  if (!isVoiceEnabled()) return
  try {
    speakSource?.stop()
    speakSource?.disconnect()
  } catch {
    /* noop */
  } finally {
    speakSource = null
  }
}

export async function listenOnce(opts: { onPartial?: (text: string) => void } = {}) {
  if (!isVoiceEnabled()) return ''
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)
  const chunks: BlobPart[] = []
  recorder.ondataavailable = e => chunks.push(e.data)

  const result = new Promise<string>(resolve => {
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const form = new FormData()
      form.append('file', blob, 'speech.webm')
      form.append('model', 'gpt-4o-mini-transcribe')
      if (sessionId) form.append('session_id', sessionId)
      try {
        const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
          body: form,
        })
        const data = await r.json().catch(() => ({})) as { text?: string }
        const text = data.text || ''
        opts.onPartial?.(text)
        resolve(text)
      } catch (err) {
        console.error('listenOnce error', err)
        resolve('')
      } finally {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  })

  recorder.start()
  setTimeout(() => {
    if (recorder.state !== 'inactive') recorder.stop()
  }, 5000)

  return result
}
