"use client"
import { useEffect, useMemo, useRef, useState } from "react"
// Minimal local type to satisfy TS in environments without DOM SpeechRecognition typings
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _SR extends Record<string, any> {}
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Mic, MicOff, Send } from "lucide-react"
import { VoiceToggle } from "./VoiceToggle"
import { getFirstQuestion, mapAnswersToStoryInput, type InterviewState, type ChatMessage, startState, acceptAnswer } from "@/lib/ai/onboardingGraph"
import { useRouter } from "next/navigation"

type Props = { designerId: string }

export default function OnboardingChat({ designerId }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [state, setState] = useState<InterviewState>(startState())
  const [input, setInput] = useState("")
  const [voiceOn, setVoiceOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("colrvia_voiceOn") === "1"
  })
  const [recognizing, setRecognizing] = useState(false)

  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== "undefined" ? window.speechSynthesis : null)
  const recogRef = useRef<_SR | null>(null)

  const speechSupported = useMemo(() => {
    if (typeof window === "undefined") return false
    return ("webkitSpeechRecognition" in window) || ("SpeechRecognition" in window)
  }, [])

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('colrvia_voiceOn', voiceOn? '1':'0') }, [voiceOn])

  useEffect(() => {
    if (!speechSupported) return
    const Rec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const inst: any = new Rec()
    inst.lang = 'en-US'
    inst.continuous = false
    inst.interimResults = false
    inst.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript
      if (t) setInput(t)
    }
    inst.onstart = () => setRecognizing(true)
    inst.onend = () => setRecognizing(false)
    inst.onerror = () => setRecognizing(false)
    recogRef.current = inst
  }, [speechSupported])

  useEffect(()=>{
    // greet
    const first = getFirstQuestion()
    const greet = `Hi! Let's build your palette. ${first.prompt}`
    setMessages([{ role:'assistant', content: greet }])
    if(voiceOn) speak(greet)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[designerId])

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  function speak(text: string) {
    if (!synthRef.current) return
    if (prefersReducedMotion) return
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 1
    u.pitch = 1
    synthRef.current.cancel()
    synthRef.current.speak(u)
  }

  async function submit(value?: string) {
    const content = (value ?? input).trim()
    if (!content) return
    setMessages(prev => [...prev, { role:'user', content }])
    setInput("")
    const newState = acceptAnswer(state, content)
    setState(newState)
    if(newState.done){
      const closing = 'Great — generating your palette now.'
      setMessages(prev => [...prev, { role:'assistant', content: closing }])
      if(voiceOn) speak(closing)
      try {
        const storyInput = mapAnswersToStoryInput(newState.answers)
        const resp = await fetch('/api/stories',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(storyInput) })
        if(resp.ok){
          const created = await resp.json()
            if(created?.id) router.push(`/reveal/${created.id}`)
        }
      } catch(e){ console.warn(e) }
      return
    }
    const nextQ = getFirstQuestion().prompt // reuse since simplified
    setMessages(prev => [...prev, { role:'assistant', content: nextQ }])
    if(voiceOn) speak(nextQ)
  }

  function toggleMic(){
    if(!speechSupported || !recogRef.current) return
    if(recognizing){ recogRef.current.stop(); return }
    try{ recogRef.current.start() }catch{}
  }

  return (
    <div className="rounded-2xl border border-linen p-4 space-y-3">
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1" aria-live="polite">
        {messages.map((m,i)=> (
          <div key={i} className={m.role==='assistant'? 'text-left':'text-right'}>
            <div className={`inline-block rounded-2xl px-3 py-2 text-sm ${m.role==='assistant'? 'bg-surface':'bg-brand text-brand-contrast'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input aria-label="Your reply" placeholder="Say it or type it…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') submit() }} />
        {speechSupported && (
          <Button type="button" variant={voiceOn? 'primary':'outline'} onClick={()=> setVoiceOn(v=>!v)} aria-pressed={voiceOn} title="Speak replies"><VoiceToggle active={voiceOn} /></Button>
        )}
        {speechSupported && (
          <Button type="button" variant="outline" onClick={toggleMic} aria-label="Toggle microphone">{recognizing? <MicOff className="h-4 w-4" />:<Mic className="h-4 w-4" />}</Button>
        )}
        <Button type="button" onClick={()=>submit()} aria-label="Send"><Send className="h-4 w-4" /></Button>
      </div>
      {!speechSupported && <p className="text-xs text-[var(--ink-subtle)]">Voice works best in Chrome.</p>}
    </div>
  )
}
