'use client'

type ChatCaptionsProps = {
  text: string
}

export default function ChatCaptions({ text }: ChatCaptionsProps) {
  return (
    <p
      aria-live="polite"
      className="h-5 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm text-muted-foreground dark:text-subtext-dark"
    >
      {text}
    </p>
  )
}

