import { ReactNode } from 'react'
import { clsx } from 'clsx'

export default function Card({ className='', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border bg-card text-card-foreground shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
