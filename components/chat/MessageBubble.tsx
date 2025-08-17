// components/chat/MessageBubble.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MessageBubble({
  role,
  children,
}: {
  role: "assistant" | "user" | "system";
  children: ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div
      className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}
      aria-label={isUser ? "You" : "Assistant"}
    >
      {!isUser && (
        <div className="mt-1 h-6 w-6 flex-shrink-0 rounded-full bg-[var(--bubble-assistant)] text-[var(--bubble-assistant-ink)] flex items-center justify-center text-xs">
          C
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-[var(--bubble-user)] text-[var(--bubble-user-ink)]"
            : role === "assistant"
              ? "bg-[var(--bubble-assistant)] text-[var(--bubble-assistant-ink)]"
              : "bg-[var(--bubble-system)] text-[var(--chat-ink)]"
        )}
        role="status"
        aria-live="polite"
      >
        {children}
      </div>
    </div>
  );
}

