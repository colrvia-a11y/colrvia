export default function RevealPage({ params, searchParams }:{ params:{ id:string }, searchParams:{ optimistic?:string } }) {
  const optimistic = searchParams?.optimistic === "1";
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      {optimistic ? (
        <>
          <h1 className="text-xl font-semibold mb-4">Generating your designs…</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_,i) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="aspect-video rounded-lg bg-neutral-200 animate-pulse mb-2" />
                <div className="h-3 w-2/3 rounded bg-neutral-200 animate-pulse" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">This takes about 8–15 seconds. You can keep browsing.</p>
        </>
      ) : (
        /* …your real reveal UI… */
        <div>/* render results */</div>
      )}
    </div>
  );
}
