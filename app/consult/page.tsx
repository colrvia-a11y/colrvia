'use client'

import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'

type OaiAction =
| { action: 'request_photo'; tips?: string[] }
| { action: 'ready_for_palette'; summary?: string }
| { action: string; [k: string]: any }

export default function ConsultPage() {
const [connected, setConnected] = useState(false)
const [status, setStatus] = useState<'idle'|'starting'|'live'>('idle')
const [log, setLog] = useState<string[]>([])
const pcRef = useRef<RTCPeerConnection | null>(null)
const dataRef = useRef<RTCDataChannel | null>(null)
const localVideoRef = useRef<HTMLVideoElement | null>(null)
const remoteAudioRef = useRef<HTMLAudioElement | null>(null)
const localStreamRef = useRef<MediaStream | null>(null)

function appendLog(s: string) { setLog(x => [s, ...x].slice(0, 50)) }

async function startCall() {
setStatus('starting')
const pc = new RTCPeerConnection()
pcRef.current = pc

// Remote audio track
const remoteStream = new MediaStream()
pc.ontrack = (e) => {
  remoteStream.addTrack(e.track)
}
// Play remote audio
const audioEl = document.createElement('audio')
audioEl.autoplay = true
audioEl.srcObject = remoteStream
remoteAudioRef.current = audioEl
document.body.appendChild(audioEl)

// Data channel for JSON actions
const dc = pc.createDataChannel('oai-events')
dataRef.current = dc
dc.onopen = () => appendLog('data: open')
dc.onmessage = (ev) => {
  try {
    const msg = JSON.parse(ev.data) as OaiAction
    if (msg.action === 'request_photo') {
      appendLog('assistant requested a photo')
      captureAndSendPhoto(msg.tips)
    } else if (msg.action === 'ready_for_palette') {
      appendLog('assistant ready_for_palette')
      // In a fuller flow, compile room profile + answers and POST to /api/stories
    } else {
      appendLog(`data: ${ev.data}`)
    }
  } catch {
    appendLog(`data(raw): ${ev.data}`)
  }
}

// Mic + (optional) camera for snapshots
const local = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
localStreamRef.current = local
local.getTracks().forEach(t => pc.addTrack(t, local))
if (localVideoRef.current) {
  localVideoRef.current.srcObject = local
  localVideoRef.current.muted = true
  localVideoRef.current.play().catch(()=>{})
}

// Create SDP offer → send to our server → it forwards to OpenAI Realtime
const offer = await pc.createOffer({ offerToReceiveAudio: true })
await pc.setLocalDescription(offer)
const r = await fetch('/api/realtime/offer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sdp: offer.sdp }),
})
if (!r.ok) {
  appendLog('offer failed'); setStatus('idle'); return
}
const answerSdp = await r.text()
await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

setConnected(true)
setStatus('live')
appendLog('live')
}

async function captureAndSendPhoto(tips?: string[]) {
const video = localVideoRef.current
if (!video) return
// Draw a frame to canvas
const canvas = document.createElement('canvas')
canvas.width = video.videoWidth || 1280
canvas.height = video.videoHeight || 720
const ctx = canvas.getContext('2d')!
ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

// Send to our vision endpoint
const res = await fetch('/api/vision/room-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    images: [dataUrl],
    brand: 'Sherwin-Williams',
  }),
})
const json = await res.json()
if (json?.ok) {
  appendLog('vision: profile created')
  // Tell the assistant we’ve submitted photos (and include a tiny summary)
  dataRef.current?.send(JSON.stringify({ action: 'submit_photos', images: 1, summary: json.profile?.fixed }))
} else {
  appendLog('vision: error')
  dataRef.current?.send(JSON.stringify({ action: 'submit_photos_error', error: json?.error || 'unknown' }))
}
}

useEffect(() => {
return () => {
pcRef.current?.getSenders().forEach(s => s.track?.stop())
pcRef.current?.close()
remoteAudioRef.current?.remove()
}
}, [])

return (
<main className="mx-auto max-w-screen-sm p-4 space-y-4">
<h1 className="text-2xl font-semibold">Live Consult (Beta)</h1>
<p className="text-sm text-muted-foreground">
Talk to your designer. When asked, snap 1–3 photos; we’ll analyze fixed materials and lighting.
</p>
  <div className="rounded-2xl border p-3 grid gap-3">
    <video ref={localVideoRef} className="w-full rounded-xl bg-black/5 aspect-video object-cover" />
    <div className="flex gap-2">
      <Button onClick={startCall} disabled={status!=='idle'}>Start consult</Button>
  <Button variant="outline" onClick={()=>captureAndSendPhoto() } disabled={!connected}>Snap test photo</Button>
    </div>
    <ul className="text-xs max-h-40 overflow-auto space-y-1">
      {log.map((l,i)=><li key={i} className="font-mono">{l}</li>)}
    </ul>
  </div>
</main>
)
}
