export function Progress({ step, total }:{ step:number; total:number }) {
  const pct = Math.round((step/total)*100);
  return (
    <div className="mb-4" aria-label={`Step ${step} of ${total}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Step {step} of {total}</p>
        <p className="text-xs text-neutral-500">{pct}%</p>
      </div>
      <div className="mt-1 h-2 rounded bg-neutral-200 overflow-hidden">
        <div className="h-full w-0 bg-brand transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
