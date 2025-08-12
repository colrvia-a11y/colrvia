"use client"
import * as React from 'react'
import { useIntakeChat } from '@/lib/hooks/useIntakeChat'

export default function OnboardingChat({ designerId }: { designerId: string }) {
  const { currentNode, input, setInput, busy, done, statusText, submit } = useIntakeChat(designerId)
  const API_MODE = process.env.NEXT_PUBLIC_ONBOARDING_MODE === 'api'

  if (!API_MODE) return null

  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/95">
      <div className="min-h-[120px]">
        {currentNode?.question ? (
          <p className="text-base md:text-lg">{currentNode.question}</p>
        ) : (
          <p className="opacity-80">Preparing questions…</p>
        )}
        {statusText && <p className="mt-2 text-sm opacity-80">{statusText}</p>}
      </div>
      {Array.isArray(currentNode?.options) && currentNode.options.length > 0 && !done && (
        <div className="mt-3 flex flex-wrap gap-2">
          {currentNode.options.map((o: string) => (
            <button
              key={o}
              disabled={busy}
              onClick={() => submit(o)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm hover:bg-white/15 disabled:opacity-50"
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {!done && (
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit(input)
            }}
            disabled={busy}
            placeholder="Say it or type it…"
            className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/60"
          />
          <button
            onClick={() => submit(input)}
            disabled={!input || busy}
            className="rounded-xl bg-white/20 px-3 py-2 text-sm hover:bg-white/25 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}
