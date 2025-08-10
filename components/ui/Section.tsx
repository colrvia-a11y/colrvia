import { ReactNode } from 'react'
export default function Section({ title, subtitle, eyebrow, actions, children }: {
  title?: string; subtitle?: string; eyebrow?: string; actions?: ReactNode; children?: ReactNode
}) {
  return (
    <section className="container-xy py-12">
      {(eyebrow || title || subtitle || actions) && (
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
            {title && <h2 className="text-2xl font-semibold">{title}</h2>}
            {subtitle && <p className="text-neutral-600 mt-1">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
