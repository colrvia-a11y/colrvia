import type { ReactNode } from 'react'

export function ChatScreen({ header, children }:{ header?:ReactNode; children:ReactNode }){
  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--paper)]">
      {header}
      <div className="flex-1 overflow-y-auto" id="chat-scroll-region">{children}</div>
    </div>
  )
}

