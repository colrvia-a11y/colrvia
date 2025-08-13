"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";

export default function RevealPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const optimistic = searchParams.get("optimistic") === "1";
  const [ready, setReady] = useState(!optimistic && !params.id.startsWith("tmp_"));

  useEffect(() => {
    if (!optimistic && !params.id.startsWith("tmp_")) return;
    let t = setInterval(async () => {
      try {
        const res = await fetch("/api/render", { method: "GET" });
        const { status } = await res.json();
        if (status === "ready") setReady(true);
      } catch {}
    }, 1000);
    return () => clearInterval(t);
  }, [optimistic, params.id]);

  useEffect(() => {
    // In a real app, when your backend returns the real jobId (via websocket/SSE/poll),
    // call router.replace(`/reveal/${realId}`) then setReady(true).
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-6">
      {/* TODO: render real results here */}
      <h1 className="text-xl font-semibold mb-4">Your designs</h1>
      {/* … */}
    </div>
  );
}
