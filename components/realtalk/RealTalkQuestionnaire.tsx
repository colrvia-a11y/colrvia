'use client'

import React, { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase/client'
import { postTurn } from '@/lib/realtalk/api'
import type { Answers, PromptSpec, TurnResponse } from '@/lib/realtalk/types'
import { useSpeech } from '@/hooks/useSpeech'
import { createPaletteFromInterview } from '@/lib/palette'
import Stepper from './Stepper'
import StickyActions from './StickyActions'
import InlineHelp from './InlineHelp'

type Props = { initialAnswers?: Answers; autoStart?: boolean }

export default function RealTalkQuestionnaire({ initialAnswers = {}, autoStart = true }: Props){
  const router = useRouter()
  const supabase = supabaseBrowser()
  void supabase
  const [answers, setAnswers] = useState<Answers>(initialAnswers)
  const [current, setCurrent] = useState<PromptSpec | null>(null)
  const [greeting, setGreeting] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{id:string; value:string|string[]}[]>([])
  const [progress, setProgress] = useState<{asked:number; maxCap?:number} | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const chipRefs = useRef<HTMLButtonElement[]>([])
  const [chipFocus, setChipFocus] = useState(0)
  const [textValue, setTextValue] = useState('')
  const [textError, setTextError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const { supported: speechOK, listening, interim, start, stop } = useSpeech({
    onFinal: (text) => {
      const normalized = text.trim().toLowerCase()
      if (normalized.startsWith('explain')) {
        return // inline help handled separately
      }
      if (current?.input_type === 'text') handleTextSubmit(text)
      else submitAnswer(text)
    }
  })

  useEffect(() => {
    if (autoStart) void nextTurn()
  }, [autoStart])

  useEffect(() => {
    setTextValue('')
    setChipFocus(0)
    setTextError(null)
  }, [current?.id])

  useEffect(() => {
    if (!current?.choices) return
    const multi = current.input_type === 'multiSelect'
    const idx = current.choices.findIndex((c) =>
      multi ? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(c.id)
            : answers[current.id] === c.id
    )
    setChipFocus(idx >= 0 ? idx : 0)
  }, [current, answers])

  async function nextTurn(ack?: {id:string; value:string|string[]}){
    setLoading(true)
    const merged = ack ? { ...answers, [ack.id]: ack.value } : answers
    try {
      const res: TurnResponse = await postTurn({ answers: merged, ack, mode:'next' })
      if (res.greeting) setGreeting(res.greeting)
      if (res.prompt) {
        setCurrent(res.prompt)
        setTimeout(() => inputRef.current?.focus(), 0)
      } else {
        setCurrent(null)
      }
      if (res.answers) setAnswers(res.answers); else setAnswers(merged)
      if (ack) setHistory(h => [...h, ack])
      if (res.progress) setProgress(res.progress)
    } finally {
      setLoading(false)
    }
  }

  function updateAnswers(id:string, value:string|string[]){
    setAnswers(a => ({...a, [id]: value}))
  }

  function submitAnswer(value:string|string[]){
    if (!current) return
    if (current.id === 'mood_words' && typeof value === 'string'){
      const words = value.trim().split(/\s+/).filter(Boolean)
      if (words.length > (current.validation?.max ?? 3)){
        setTextError(`Please keep this to ${current.validation?.max ?? 3} words.`)
        return
      }
    }
    updateAnswers(current.id, value)
    void nextTurn({ id: current.id, value })
  }

  function handleTextSubmit(text:string){
    const v = text.trim()
    if (!v && current?.validation?.required) return
    submitAnswer(v)
    setTextValue('')
    setTextError(null)
    if (inputRef.current) (inputRef.current as HTMLInputElement).value = ''
  }

  function toggleChip(choiceId:string){
    if (!current) return
    if (current.input_type === 'singleSelect'){
      submitAnswer(choiceId)
    } else {
      const prev = (answers[current.id] as string[] | undefined) ?? []
      const exists = prev.includes(choiceId)
      const next = exists ? prev.filter(x => x!==choiceId) : [...prev, choiceId]
      updateAnswers(current.id, next)
    }
  }

  function handleChipKey(e:KeyboardEvent<HTMLButtonElement>, idx:number, choiceId:string){
    if (!current?.choices) return
    const total = current.choices.length
    switch(e.key){
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        {const next=(idx+1)%total; chipRefs.current[next]?.focus(); setChipFocus(next);}
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        {const prev=(idx-1+total)%total; chipRefs.current[prev]?.focus(); setChipFocus(prev);}
        break
      case 'Enter':
      case ' ':
        e.preventDefault();
        toggleChip(choiceId)
        break
    }
  }

  function onBack(){
    const prev=[...history]; prev.pop();
    const newAnswers:{[k:string]:any}={...answers};
    if (current?.id && newAnswers[current.id]) delete newAnswers[current.id]
    setHistory(prev); setAnswers(newAnswers); void nextTurn()
  }

  const total = progress?.maxCap ?? 10
  const asked = progress?.asked ?? (history.length + (current ? 1 : 0))
  const percent = Math.min(100, Math.round((asked / total) * 100))

  const isText = current?.input_type === 'text'
  const isMulti = current?.input_type === 'multiSelect'
  const required = current?.validation?.required
  const currentAnswer = current ? answers[current.id] : undefined
  const hasAnswer = Array.isArray(currentAnswer) ? currentAnswer.length>0 : Boolean(currentAnswer)
  const continueDisabled = loading || (isText && (required && !textValue.trim())) || (isMulti && required && !hasAnswer) || Boolean(textError)
  const canSkip = !required

  function handleContinue(){
    if (isText){
      handleTextSubmit(textValue)
    } else if (isMulti){
      if (Array.isArray(currentAnswer)) submitAnswer(currentAnswer)
    }
  }

  function onSkip(){ if (current) submitAnswer('') }

  // text counting helper
  function onTextChange(v:string){
    setTextValue(v)
    if (current?.id === 'mood_words'){
      const words = v.trim().split(/\s+/).filter(Boolean)
      setTextError(words.length > (current.validation?.max ?? 3) ? `Please keep this to ${current.validation?.max ?? 3} words.` : null)
    }
  }

  if (!current){
    return (
      <div className="rt-shell">
        <Header greeting={greeting} />
        <div className="rt-card" aria-live="polite">
          <h2>All set 🎉</h2>
          <p>Thanks! We’ve gathered what we need. You can review or restart any time.</p>
          <div className="rt-actions">
            <button
              type="button"
              onClick={async () => {
                setGenerating(true)
                // Persist latest answers for the API bridge to find if needed
                try {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('colrvia:interview', JSON.stringify({ answers }))
                  }
                } catch {}
                // Prefer passing answers directly so we’re not relying on storage timing
                setGenerationError(null)
                const res = await createPaletteFromInterview(answers)
                if ('error' in res) {
                  setGenerating(false)
                  if (res.error === 'AUTH_REQUIRED') {
                    router.push('/sign-in?next=/start/interview')
                  } else {
                    setGenerationError("Sorry — we couldn’t finish your Color Story. Please try again.")
                  }
                  return
                }
                // Navigate to reveal page with optimistic loading indicator
                router.replace(`/reveal/${res.id}?optimistic=1`)
              }}
              disabled={generating}
            >
              {generating ? 'Working…' : 'Create my color story'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAnswers({})
                setHistory([])
                setCurrent(null)
                setProgress(undefined)
                void nextTurn()
              }}
            >
              Restart
            </button>
          </div>
          {generationError && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {generationError}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rt-shell">
      <Header greeting={greeting} />
      <Stepper step={asked} total={total} percent={percent} />
      <div className="rt-card" aria-live="polite">
        <h2>{current.text}</h2>
        <InlineHelp questionText={current.text} answers={answers} />
        {current.choices?.length ? (
          <div className="rt-chips" role={isMulti ? 'group':'radiogroup'} aria-label="Suggested answers">
            {current.choices.map((c,i)=>{
              const active = isMulti ? Array.isArray(currentAnswer) && (currentAnswer as string[]).includes(c.id) : currentAnswer === c.id
              return (
                <button
                  ref={el => (chipRefs.current[i]=el!)}
                  key={c.id}
                  type="button"
                  className={`rt-chip ${active?'is-active':''}`}
                  onClick={()=>{ setChipFocus(i); toggleChip(c.id) }}
                  role={isMulti ? 'checkbox':'radio'}
                  aria-checked={active}
                  tabIndex={chipFocus===i?0:-1}
                  onKeyDown={(e)=>handleChipKey(e,i,c.id)}
                >{c.label}</button>
              )
            })}
          </div>
        ):null}

        <div className="rt-free">
          <div className="rt-input-row">
            <input
              ref={inputRef as any}
              type="text"
              placeholder="Type your answer…"
              aria-label="Type your answer"
              value={textValue}
              onChange={(e)=>onTextChange(e.target.value)}
              onKeyDown={(e)=> e.key==='Enter' && handleTextSubmit(textValue)}
            />
            <button type="button" className={`rt-mic ${listening?'is-live':''}`} aria-pressed={listening} onClick={()=>listening?stop():start()} disabled={!speechOK}>{listening?'Stop':'🎙️'}</button>
          </div>
          {current.id==='mood_words' && <small className="rt-help">Max 3 words ({textValue.trim()?textValue.trim().split(/\s+/).filter(Boolean).length:0}/3)</small>}
          {interim && <span className="rt-interim" aria-live="polite">{interim}</span>}
          {textError && <div className="rt-error" aria-live="assertive">{textError}</div>}
        </div>

        <StickyActions onBack={onBack} onSkip={onSkip} onContinue={handleContinue} disableContinue={continueDisabled} canSkip={canSkip} />
      </div>
      <style jsx>{`
        .rt-shell { max-width:720px; margin:0 auto; }
        .rt-card { background: var(--color-bg-alt); border:1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-8); box-shadow: var(--shadow-lg); }
        .rt-chips { display:flex; flex-wrap:wrap; gap: var(--space-3); margin: var(--space-4) 0; }
        .rt-chip { border:1px solid var(--color-border); background: var(--color-bg-alt); padding:10px 14px; border-radius: var(--radius-pill); }
        .rt-chip.is-active { background: var(--color-accent); color: var(--color-accent-fg); border-color: transparent; }
        .rt-chip:focus-visible { outline:none; box-shadow: var(--focus-ring); }
        .rt-free { margin-top: var(--space-4); display:flex; flex-direction:column; gap: var(--space-3); }
        .rt-input-row { display:flex; gap: var(--space-3); align-items:center; }
        .rt-input-row input { flex:1; padding: var(--space-3) var(--space-4); border:1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); }
        .rt-mic { padding: var(--space-3) var(--space-4); border:1px solid var(--color-border); border-radius: var(--radius-pill); background: var(--color-bg); }
        .rt-mic.is-live { box-shadow:0 0 0 3px color-mix(in oklab,var(--brand) 40%, transparent); }
        .rt-help { font-size: var(--text-sm); color: var(--color-fg-muted); }
        .rt-interim { font-size: var(--text-sm); color: var(--color-fg-muted); }
        .rt-error { color: var(--color-danger); font-size: var(--text-sm); }
      `}</style>
    </div>
  )
}

function Header({ greeting }: { greeting?: string }){
  return (
    <header className="rt-header">
      <div className="rt-avatar" aria-hidden>🧑‍🎨</div>
      <div className="rt-headcopy">
        <h1>RealTalk Interview</h1>
        <p>{greeting ?? 'Let\u2019s make this room feel right.'}</p>
      </div>
      <style jsx>{`
        .rt-header { display:flex; gap: var(--space-3); align-items:center; margin-bottom: var(--space-4); }
        .rt-avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: var(--color-bg-inset); }
        .rt-headcopy h1 { font-size: var(--text-xl); margin:0; }
        .rt-headcopy p { font-size: var(--text-sm); color: var(--color-fg-muted); margin:0; }
      `}</style>
    </header>
  )
}
