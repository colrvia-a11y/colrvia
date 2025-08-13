export function LivePreview({ selection }:{ selection:{ room?:string; style?:string } }) {
  return (
    <aside aria-live="polite" className="sticky top-4 rounded-xl border p-3 md:p-4">
      <div className="aspect-video w-full rounded-lg bg-neutral-100 mb-3" aria-hidden />
      <h3 className="text-sm font-semibold mb-1">You’ll get</h3>
      <ul className="text-sm list-disc pl-5 space-y-1">
        <li>4 variations in <strong>{selection.style || "your style"}</strong></li>
        <li>2 colorways per variation</li>
        <li>High-res images + sources</li>
        <li>Private by default</li>
      </ul>
      <p className="mt-3 text-xs text-neutral-500">Typical render time: ~12s</p>
    </aside>
  );
}
