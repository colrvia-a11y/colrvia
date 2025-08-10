"use client"
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  size?: 'sm' | 'md'
}

export default function Chip({ className, active=false, size='md', ...rest }: ChipProps){
  const base = 'inline-flex items-center justify-center rounded-full border text-[12px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]'
  const sizing = size==='sm'? 'px-3 py-1':'px-4 py-1.5'
  const styles = clsx(base, sizing, active ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-[var(--bg-surface)] hover:bg-[#F2EFE9] border-[var(--border)] text-[var(--ink)]', className)
  return <button type="button" className={twMerge(styles)} aria-pressed={active} {...rest} />
}
