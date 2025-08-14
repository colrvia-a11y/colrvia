"use client"
import * as React from 'react'
import Link from 'next/link'
import { usePreferencesChat } from '@/lib/hooks/usePreferencesChat'

export default function PreferencesChat({ designerId }: { designerId: string }) {
  const { currentQuestion, choices, input, setInput, busy, done, statusText, submit, storyId } =
    usePreferencesChat(designerId)

  return (
    <div
      role="dialog"
      aria-label="Preferences chat"
      className="rounded-2xl border border-white/15 bg-white/5 p-4 text-white/95"
    >
      <div className="min-h-[120px]">
        {currentQuestion ? (
          <p className="text-base md:text-lg">{currentQuestion}</p>
        ) : (
          <p className="opacity-80">Preparing questions…</p>
        )}
        {statusText && <p className="mt-2 text-sm opacity-80">{statusText}</p>}
      </div>
      {Array.isArray(choices) && choices.length > 0 && !done && (
        <div className="mt-3 flex flex-wrap gap-2">
          {choices.map((o: string) => (
            <button
              type="button"
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
            type="button"
            onClick={() => submit(input)}
            disabled={!input || busy}
            className="rounded-xl bg-white/20 px-3 py-2 text-sm hover:bg-white/25 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      )}
      {done && storyId && (
        <div className="mt-4">
          <Link
            href={`/reveal/${storyId}`}
            className="rounded-xl bg-white/20 px-4 py-2 text-sm hover:bg-white/25"
          >
            Reveal My Palette
          </Link>
        </div>
      )}
    </div>
  )
}
