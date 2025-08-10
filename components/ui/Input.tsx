import * as React from 'react'
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-black ${props.className||''}`} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-black ${props.className||''}`} />
}
export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="text-sm text-neutral-700">{children}</label>
}
