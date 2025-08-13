"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics/client";

export default function RevealPoller({ id }: { id: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const once = useRef(false);
  const optimistic = params.get("optimistic") === "1";

  useEffect(() => {
    if (!optimistic) return;
    if (id.startsWith("tmp_")) return; // tmp IDs just show skeleton

    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/stories/${id}/status`, { cache: "no-store" });
        if (!res.ok) return;
        const { status } = (await res.json()) as { status: string };
        if (alive && status === "ready" && !once.current) {
          once.current = true;
          track("render_complete", { story_id: id });
          // remove ?optimistic=1 and render final page
          const url = new URL(location.href);
          url.searchParams.delete("optimistic");
          router.replace(url.toString());
          return;
        }
      } catch {}
      if (alive) setTimeout(tick, 900);
    };
    tick();
    return () => { alive = false; };
  }, [id, optimistic, router]);

  return null;
}
