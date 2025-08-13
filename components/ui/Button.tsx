"use client"
/* eslint-disable react/button-has-type */
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

type Variant = 'primary' | 'outline' | 'ghost'
type Polymorphic = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; as?: any; href?: string }

export default function Button({ className, variant='primary', as:Comp='button', href, type, ...rest }: Polymorphic) {
  const base = 'inline-flex items-center justify-center font-medium text-sm rounded-[var(--radius)] px-5 h-11 gap-2 transition-colors ease-[cubic-bezier(.2,.8,.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none shadow-sm'
  const variants = {
    primary: 'bg-brand text-brand-contrast hover:bg-brand-hover',
    outline: 'bg-surface border border-linen text-ink hover:bg-paper',
    ghost: 'text-foreground hover:bg-paper hover:text-foreground'
  } as const
  const styles = clsx(base, variants[variant], className)
  if (Comp !== 'button') return <Comp href={href} className={twMerge(styles)} {...rest} />
  return <button type={type ? type : 'button'} className={twMerge(styles)} {...rest} />
}
