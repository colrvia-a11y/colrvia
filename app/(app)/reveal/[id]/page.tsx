"use client";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { ActionsBar } from "@/components/reveal/ActionsBar";
import { ResultCard } from "@/components/reveal/ResultCard";
import { CompareDialog } from "@/components/reveal/CompareDialog";
import { copy } from "@/content/microcopy";

type Story = { id:string; status:"draft"|"queued"|"processing"|"ready"|"failed"; result:null|{ images:{ url:string; width?:number; height?:number }[] } ; error?:string|null };

export default function RevealPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseBrowser();
  const [story, setStory] = useState<Story | null>(null);
  const [compare, setCompare] = useState<{a:number; b:number} | null>(null);

  useEffect(() => {
    supabase.from("stories").select("id,status,result,error").eq("id", params.id).single().then(({ data }) => data && setStory(data as Story));
    const ch = supabase.channel(`story:${params.id}`).on("postgres_changes", { event:"*", schema:"public", table:"stories", filter:`id=eq.${params.id}` }, p => setStory(p.new as Story)).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [params.id, supabase]);

  const ready = story?.status === "ready";
  const failed = story?.status === "failed";

  if (!ready && !failed) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        <h1 className="text-xl font-semibold mb-4">{copy.reveal.generatingTitle}</h1>
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="aspect-video rounded-lg bg-neutral-200 animate-pulse mb-2" />
              <div className="h-3 w-2/3 rounded bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-neutral-500">{copy.reveal.generatingSub}</p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        <h1 className="text-xl font-semibold mb-2">{copy.reveal.errorTitle}</h1>
        <p className="text-sm text-neutral-600 mb-4">{story?.error ?? copy.reveal.errorSub}</p>
        <a href="/preferences/therapist" className="inline-flex rounded-xl px-4 py-2 border">Try again</a>
      </div>
    );
  }

  const imgs = story?.result?.images ?? [];
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      <ActionsBar storyId={story!.id} />
      <h1 className="text-xl font-semibold mb-4">{copy.reveal.readyTitle}</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {imgs.map((img, i) => (
          <ResultCard
            key={i} url={img.url} index={i} storyId={story!.id}
            width={img.width ?? 1600} height={img.height ?? 900}
            onMoreLike={async (idx) => {
              const res = await fetch(`/api/stories/${story!.id}/similar`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ seedIndex: idx }) });
              const { storyId } = await res.json().catch(()=>({}));
              if (storyId) location.assign(`/reveal/${storyId}?optimistic=1`);
            }}
            onCompare={(idx) => setCompare(cur => cur ? { a: cur.a, b: idx } : { a: idx, b: Math.min(idx+1, imgs.length-1) })}
          />
        ))}
      </div>

      {compare && imgs[compare.a] && imgs[compare.b] && (
        <CompareDialog a={imgs[compare.a]} b={imgs[compare.b]} open={true} onOpenChange={(v)=>!v && setCompare(null)} />
      )}
    </div>
  );
}
