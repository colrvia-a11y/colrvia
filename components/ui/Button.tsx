"use client"
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'; as?: any; href?: string }
export default function Button({ className, variant='primary', as:Comp='button', href, ...rest }: Props) {
  const styles = clsx(
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'secondary' && 'btn-secondary',
    variant === 'ghost' && 'hover:bg-neutral-50',
    className
  )
  if (Comp !== 'button') return <Comp href={href} className={twMerge(styles)} {...rest} />
  return <button className={twMerge(styles)} {...rest} />
}
