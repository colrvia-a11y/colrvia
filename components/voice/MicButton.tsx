'use client'

import { Mic } from 'lucide-react'

type MicButtonProps = {
  onClick?: () => void
  isListening?: boolean
}

export default function MicButton({ onClick, isListening }: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2"
    >
      <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand text-brand-contrast">
        <Mic className="h-10 w-10" />
      </span>
      <span className="text-sm font-medium">
        {isListening ? 'Listening…' : 'Tap to answer'}
      </span>
    </button>
  )
}

