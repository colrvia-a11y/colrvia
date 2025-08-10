"use client"
interface ProgressProps { value:number; max:number }
export default function Progress({ value, max }: ProgressProps){
  const pct = Math.min(100, Math.round((value/max)*100))
  return (
    <div className="h-2 w-full rounded-full bg-[var(--border)] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Setup progress">
      <div className="h-full bg-[var(--brand)] transition-all" style={{ width: pct+'%' }} />
    </div>
  )
}
