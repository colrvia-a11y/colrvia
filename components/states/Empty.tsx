export function Empty({ title, action }:{ title: string; action?: React.ReactNode }) {
  return (
    <div className="text-center p-8 border border-dashed border-[var(--border)] rounded-2xl">
      <div className="text-lg font-medium mb-2">{title}</div>
      {action}
    </div>
  )
}
