"use client"
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'
type Polymorphic = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; as?: any; href?: string }

export default function Button({ className, variant='primary', as:Comp='button', href, ...rest }: Polymorphic) {
  const styles = clsx(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'secondary' && 'btn-secondary',
    variant === 'ghost' && 'btn-ghost',
    className
  )
  if (Comp !== 'button') return <Comp href={href} className={twMerge(styles)} {...rest} />
  return <button className={twMerge(styles)} {...rest} />
}
