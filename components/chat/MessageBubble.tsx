"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MessageBubble({
  role,
  children,
}: { role: "assistant" | "user" | "system"; children: ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={cn("w-full flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed",
          "transition-all",
          "motion-reduce:transition-none",
          isUser
            ? "bg-black text-white"
            : "bg-white text-black border border-black/10"
        )}
        role="status"
        aria-live="polite"
      >
        {children}
      </div>
    </div>
  );
}
