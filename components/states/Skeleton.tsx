export function Skeleton({ className = '' }:{ className?: string }) {
  return <div className={`animate-pulse bg-[var(--surface-elev)] rounded ${className}`} />
}
