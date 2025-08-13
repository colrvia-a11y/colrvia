"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Skeleton } from "@/components/Skeleton";

type Story = {
  id: string;
  status: "draft" | "queued" | "processing" | "ready" | "failed";
  result: null | { images: { url: string }[]; meta?: any };
  error?: string | null;
};

export default function RevealPage({ params }: { params: { id: string } }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [story, setStory] = useState<Story | null>(null);

  // Initial fetch
  useEffect(() => {
    supabase
      .from("stories")
      .select("id,status,result,error")
      .eq("id", params.id)
      .single()
      .then(({ data }) => data && setStory(data as Story));
  }, [params.id, supabase]);

  // Live updates
  useEffect(() => {
    const ch = supabase
      .channel(`story:${params.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stories", filter: `id=eq.${params.id}` },
        (p) => {
          setStory(p.new as Story);
        }
      )
      .subscribe();
    return () => void supabase.removeChannel(ch);
  }, [params.id, supabase]);

  const ready = story?.status === "ready";
  const failed = story?.status === "failed";

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      {!ready && !failed && (
        <>
          <h1 className="text-xl font-semibold mb-4">Generating your designs…</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="aspect-video rounded-lg bg-neutral-200 animate-pulse mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">This takes about 8–15 seconds. You can keep browsing.</p>
        </>
      )}
      {failed && (
        <>
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-neutral-600 mb-4">{story?.error ?? "Please try again."}</p>
          <a href="/intake" className="inline-flex rounded-xl px-4 py-2 border">Try again</a>
        </>
      )}
      {ready && (
        <>
          <h1 className="text-xl font-semibold mb-4">Your designs</h1>
          <div className="grid md:grid-cols-2 gap-4">
            {story?.result?.images?.map((img, i) => (
              <figure key={i} className="rounded-xl border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={`Variation ${i + 1}`}
                  className="w-full h-auto"
                  loading={i > 1 ? "lazy" : "eager"}
                />
                <figcaption className="p-2 text-sm text-neutral-600">Variation {i + 1}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
