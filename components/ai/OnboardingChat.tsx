"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from 'next/dynamic'
const LoadingOverlay = dynamic(()=>import('@/components/ux/LoadingOverlay'), { ssr:false })
const ConfettiBurst = dynamic(()=>import('@/components/ux/ConfettiBurst'), { ssr:false })
import { motion } from 'framer-motion'
// Minimal local type to satisfy TS in environments without DOM SpeechRecognition typings
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface _SR extends Record<string, any> {}
import Button from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Mic, MicOff, Send } from "lucide-react"
import { VoiceToggle } from "./VoiceToggle"
import { getFirstQuestion, getCurrentNode, mapAnswersToStoryInput, type InterviewState, type ChatMessage, startState, acceptAnswer } from "@/lib/ai/onboardingGraph"
import { track } from "@/lib/analytics"
import { useRouter } from "next/navigation"

type Props = { designerId: string }

export default function PreferencesChat({ designerId }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [state, setState] = useState<InterviewState>(startState())
  const [intakeReady, setIntakeReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [input, setInput] = useState("")
  const currentNode = getCurrentNode(state)
  const isMulti = currentNode.type === 'multi_select'
  const [multiTemp, setMultiTemp] = useState<string[]>([])
  const minSelect = (currentNode as any).min ?? 0
  const maxSelect = (currentNode as any).max ?? Infinity
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

  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('colrvia_voiceOn', voiceOn? '1':'0'); track('voice_toggle',{ on: voiceOn }) }, [voiceOn])

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
    // Resume or start intake then greet if new
    let ignore = false
    ;(async () => {
      setLoading(true)
      try {
        // attempt resume
        const r0 = await fetch('/api/intakes/resume')
        if(r0.ok){
          const j = await r0.json().catch(()=>null)
          if(j?.ok && j.intake && !ignore){
            setMessages(j.intake.messages ?? [])
            setState(j.intake.state ?? startState())
            setIntakeReady(true)
            track('intake_resume',{ designerId })
          }
        }
        if(!ignore && !intakeReady){
          await fetch('/api/intakes/start',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ designerId }) })
          setIntakeReady(true)
          track('intake_start',{ designerId })
        }
        if(!ignore && messages.length === 0){
          const first = getFirstQuestion()
          const greet = `Hi! Let's build your palette. ${first.prompt}`
          setMessages([{ role:'assistant', content: greet }])
          const firstNode = getFirstQuestion()
          // TODO: Rename component/file to PreferencesChat; events migrated from onboarding_* to preferences_*
          track('preferences_question',{ designerId, key: firstNode.key, type: firstNode.type })
          if(voiceOn) speak(greet)
        }
      } finally {
        if(!ignore) setLoading(false)
      }
    })()
    return () => { ignore = true }
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

  async function submit(value?: string, source: 'chips' | 'text' | 'voice' = 'text') {
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
    setFinalizing(true)
    const resp = await fetch('/api/stories',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(storyInput) })
        if(resp.ok){
          const created = await resp.json()
            if(created?.id){
        setCelebrate(true)
        await new Promise(r=>setTimeout(r,350))
              try { await fetch('/api/intakes/finalize',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ storyId: created.id }) }) } catch {}
              track('preferences_complete',{ designerId, answers: Object.keys(newState.answers).length })
              router.push(`/reveal/${created.id}`)
            }
        }
    } catch(e){ console.warn(e) }
    finally { setFinalizing(false) }
      return
    }
  const nextQ = getCurrentNode(newState).prompt
    setMessages(prev => [...prev, { role:'assistant', content: nextQ }])
    try {
      const node = getCurrentNode(newState)
  track('preferences_answer', node.options? { designerId, key: node.key, type: node.type, source, hasOptions:true } : { designerId, key: node.key, type: node.type, source, len: content.length })
  track('preferences_question',{ designerId, key: getCurrentNode(newState).key, type: getCurrentNode(newState).type })
    } catch {}
    // patch persistence
    try {
      await fetch('/api/intakes/patch',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ state: newState, messages: [...messages, { role:'user', content }, { role:'assistant', content: nextQ }], done: newState.done }) })
    } catch {}
    if(voiceOn) speak(nextQ)
  }

  function toggleMic(){
    if(!speechSupported || !recogRef.current) return
    if(recognizing){ recogRef.current.stop(); track('mic_toggle',{ on:false }); return }
    try{ recogRef.current.start(); track('mic_toggle',{ on:true }) }catch{}
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
      {currentNode.options?.length ? (
        <div className="flex flex-wrap gap-2" aria-label="Quick choices">
          {currentNode.options.map(opt => {
            const selected = isMulti ? multiTemp.includes(opt) : false
            return (
              <motion.button
                key={opt}
                type="button"
                whileTap={{ scale:0.96 }}
                whileHover={{ scale: isMulti? 1 : 1.02 }}
                onClick={()=>{
                  if(!isMulti){
                    submit(opt,'chips')
                    return
                  }
                  setMultiTemp(prev => {
                    const has = prev.includes(opt)
                    if(has) return prev.filter(v=>v!==opt)
                    if(prev.length >= maxSelect) return prev
                    return [...prev, opt]
                  })
                }}
                className={`px-3 py-1 rounded-full border text-sm transition ${selected? 'bg-brand text-brand-contrast':'bg-surface hover:bg-paper'}`}
                aria-pressed={selected}
              >{opt}</motion.button>
            )
          })}
          {isMulti && (
            <motion.button
              type="button"
              whileTap={{ scale:0.96 }}
              onClick={()=>{ if(multiTemp.length >= minSelect){ submit(multiTemp.join(', ')); setMultiTemp([]) } }}
              disabled={multiTemp.length < minSelect}
              className="px-3 py-1 rounded-full border text-sm bg-brand text-brand-contrast disabled:opacity-50"
            >Continue</motion.button>
          )}
        </div>
      ): null}
      {finalizing && <LoadingOverlay text="Mixing paints…" />}
      {celebrate && <ConfettiBurst />}
    </div>
  )
}
