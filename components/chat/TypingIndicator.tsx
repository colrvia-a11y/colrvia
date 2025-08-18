export function TypingIndicator(){
  return (
    <div className="px-3 pb-2">
      <div className="inline-flex items-center gap-1 rounded-2xl bg-[color-mix(in_oklab,var(--surface)_85%,white_15%)] px-3 py-2">
        <span className="inline-block h-1.5 w-1.5 animate-bounce [animation-delay:-.2s] rounded-full bg-[var(--ink)]/70"></span>
        <span className="inline-block h-1.5 w-1.5 animate-bounce [animation-delay:-.1s] rounded-full bg-[var(--ink)]/70"></span>
        <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ink)]/70"></span>
      </div>
    </div>
  )
}

