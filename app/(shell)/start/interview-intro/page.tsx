"use client"
import Link from 'next/link'

const PHONE_CALL_URL =
  process.env.NEXT_PUBLIC_PHONE_CALL_URL ||
  (process.env.NEXT_PUBLIC_PHONE_NUMBER
    ? `tel:${process.env.NEXT_PUBLIC_PHONE_NUMBER}`
    : 'mailto:studio@colrvia.com?subject=Phone%20Consultation&body=Hi%20Via%2C%20I%27d%20like%20a%20quick%20call%20about%20a%20design%20consultation.')

export default function InterviewIntroPage() {
  return (
    <main className="container max-w-content mx-auto px-4 py-12">
      <header className="text-center mb-10">
        <h1 className="font-display text-4xl leading-tight mb-3">Pick how you want to start</h1>
        <p className="text-[15px] text-ink-subtle">
          Three fast ways to talk through your vision. Choose what’s most comfortable—voice, chat, or a quick phone call.
        </p>
      </header>

      <section className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* Voice */}
        <article className="card p-5 sm:p-6">
          <header className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="inline-flex items-center justify-center w-9 h-9 rounded-full border">
              {/* mic icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 1 0-8 0v4a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <div>
              <h2 className="font-medium text-lg">Talk with VIA AI</h2>
              <p className="text-sm text-ink-subtle -mt-0.5">Voice conversation · ~10 minutes</p>
            </div>
          </header>

          <p className="text-sm leading-6 mb-3">
            Natural back-and-forth with VIA to capture your style, space, and goals quickly.
          </p>

          <details className="group text-sm">
            <summary className="flex items-center gap-2 cursor-pointer select-none text-ink">
              <svg className="w-4 h-4 transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              More about how it works
            </summary>
            <div className="mt-2 pl-6 text-ink-subtle">
              Speak freely. VIA asks smart follow-ups and confirms key details before creating your palette.
            </div>
          </details>

          <div className="mt-5">
            <Link href="/start/interview" className="btn btn-primary w-full">Start voice interview</Link>
          </div>
        </article>

        {/* Chat */}
        <article className="card p-5 sm:p-6">
          <header className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="inline-flex items-center justify-center w-9 h-9 rounded-full border">
              {/* chat icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 5V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h2 className="font-medium text-lg">Chat with VIA AI</h2>
              <p className="text-sm text-ink-subtle -mt-0.5">Type or tap answers · ~10 minutes</p>
            </div>
          </header>

          <p className="text-sm leading-6 mb-3">
            Prefer texting? Answer one question at a time—switch to voice any time.
          </p>

          <details className="group text-sm">
            <summary className="flex items-center gap-2 cursor-pointer select-none text-ink">
              <svg className="w-4 h-4 transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              What to expect
            </summary>
            <div className="mt-2 pl-6 text-ink-subtle">
              Short, guided prompts with examples. Your progress saves automatically.
            </div>
          </details>

          <div className="mt-5">
            <Link href="/start/text-interview" className="btn btn-primary w-full">Start chat interview</Link>
          </div>
        </article>

        {/* Phone */}
        <article className="card p-5 sm:p-6">
          <header className="flex items-center gap-3 mb-3">
            <span aria-hidden="true" className="inline-flex items-center justify-center w-9 h-9 rounded-full border">
              {/* phone icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 3h10a2 2 0 0 1 2 2v14l-4-3H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <h2 className="font-medium text-lg">Receive a phone call</h2>
              <p className="text-sm text-ink-subtle -mt-0.5">Human call · 10–15 minutes</p>
            </div>
          </header>

          <p className="text-sm leading-6 mb-3">
            Want a quick human chat? We’ll call to confirm your goals and next steps.
          </p>

          <details className="group text-sm">
            <summary className="flex items-center gap-2 cursor-pointer select-none text-ink">
              <svg className="w-4 h-4 transition-transform group-open:rotate-45" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Scheduling
            </summary>
            <div className="mt-2 pl-6 text-ink-subtle">
              You’ll pick a time that works. If you’re on mobile, tap to call right away.
            </div>
          </details>

          <div className="mt-5">
            <a href={PHONE_CALL_URL} className="btn btn-primary w-full" rel="noopener noreferrer">
              Schedule / Call
            </a>
          </div>
        </article>
      </section>

      <p className="text-xs text-ink-subtle text-center mt-6">
        You can switch methods at any time—your answers stay with you.
      </p>
    </main>
  )
}

