export function ErrorState({ title, retry }:{ title: string; retry?: () => void }) {
  return (
    <div className="text-center p-8 border border-[var(--border)] rounded-2xl">
      <div className="text-lg font-semibold mb-2 text-red-600">{title}</div>
      {retry && (
        <button type="button" className="px-3 py-2 border rounded" onClick={retry}>
          Retry
        </button>
      )}
    </div>
  )
}
