"use client";

import { useRouter } from "next/navigation";
import { copyToClipboard } from "@/lib/client/download";
import { useToast } from "@/components/ui/Toast";

export function ActionsBar({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { show, ToastEl } = useToast();

  async function shareProject() {
    const url = `${location.origin}/reveal/${jobId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Colrvia designs", url });
        return;
      } catch {}
    }
    const ok = await copyToClipboard(url);
    show(ok ? "Link copied!" : "Couldn’t copy link");
  }

  async function downloadAll() {
    const res = await fetch(`/api/jobs/${jobId}/download-zip`);
    if (!res.ok) return show("Couldn’t prepare ZIP");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `colrvia-${jobId}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    show("Downloading ZIP…");
  }

  async function retryJob() {
    const res = await fetch(`/api/jobs/${jobId}/retry`, { method: "POST" });
    const data = await res.json();
    if (data?.jobId) {
      show("Starting a new variation…");
      router.push(`/reveal/${data.jobId}?optimistic=1`);
    } else {
      show("Retry failed");
    }
  }

  return (
    <>
      <div role="toolbar" aria-label="Project actions" className="sticky top-0 z-20 -mx-4 md:mx-0 mb-4 border-b bg-white/85 dark:bg-neutral-950/85 backdrop-blur px-4 py-2">
        <div className="flex gap-2">
          <button type="button" onClick={downloadAll} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">⬇️ Download all</button>
          <button type="button" onClick={shareProject} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">🔗 Share</button>
          <button type="button" onClick={retryJob} className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 focus-visible:ring-2">🔁 Try another set</button>
        </div>
      </div>
      {ToastEl}
    </>
  );
}
