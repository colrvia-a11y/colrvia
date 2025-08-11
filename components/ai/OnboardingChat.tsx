"use client"
import { useEffect, useState } from "react"
import { Input, Button } from "@/components/ui"
import { useRouter } from "next/navigation"

type Props = { designerId: string }

const API_MODE = process.env.NEXT_PUBLIC_ONBOARDING_MODE === "api"

export default function OnboardingChat({ designerId }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string>()
  const [currentNode, setCurrentNode] = useState<any>()

  useEffect(() => {
    if (!API_MODE) return
    let ignore = false
    ;(async () => {
      const r = await fetch("/api/intakes/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ designerId }) })
      const j = await r.json()
      if (!ignore) {
        setSessionId(j.sessionId)
        setCurrentNode(j.step.node)
        setMessages([{ role: "assistant", content: phrase(j.step.node.question) }])
      }
    })()
    return () => { ignore = true }
  }, [designerId])

  async function submit(value?: string) {
    const content = (value ?? input).trim()
    if (!content) return
    if (API_MODE) {
      const r = await fetch("/api/intakes/step", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, answer: content }) })
      const j = await r.json()
      if (j.step.type === "question") {
        setCurrentNode(j.step.node)
        setMessages(m => [...m, { role: "user", content }, { role: "assistant", content: phrase(j.step.node.question) }])
      } else {
        const fin = await fetch("/api/intakes/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) })
        const data = await fin.json()
        const resp = await fetch('/api/stories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data.input, palette_v2: data.palette_v2, designerKey: designerId }) })
        if (resp.ok) {
          const created = await resp.json()
          router.push(`/reveal/${created.id}`)
        }
      }
      setInput("")
      return
    }
  }

  if (!API_MODE) {
    return <div className="p-4">Onboarding available only in API mode.</div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "assistant" ? "text-left" : "text-right"}>
            <div className="inline-block rounded-2xl px-3 py-2 text-sm bg-surface">{m.content}</div>
          </div>
        ))}
      </div>
      {currentNode?.options?.length ? (
        <div className="flex flex-wrap gap-2" aria-label="Quick choices">
          {currentNode.options.map((opt: string) => (
            <button key={opt} type="button" className="px-2 py-1 rounded border" onClick={() => submit(opt)}>
              {opt}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') submit() }} />
        <Button type="button" onClick={() => submit()}>Send</Button>
      </div>
    </div>
  )
}

function phrase(q: string) { return q }
