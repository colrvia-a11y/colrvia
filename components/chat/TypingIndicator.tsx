// components/chat/TypingIndicator.tsx
"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bubble-assistant-ink)] [animation-delay:0ms]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bubble-assistant-ink)] [animation-delay:150ms]"></div>
      <div className="h-2 w-2 animate-bounce rounded-full bg-[var(--bubble-assistant-ink)] [animation-delay:300ms]"></div>
    </div>
  );
}

