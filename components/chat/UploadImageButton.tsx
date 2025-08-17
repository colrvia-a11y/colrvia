"use client";
import { useRef, useState } from "react";

export function UploadImageButton({ onNotes }: { onNotes: (notes: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl px-3 py-2 border border-black/10 hover:bg-black/5 text-sm"
      >
        Upload room photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          const b64 = await fileToDataUrl(file);
          const resp = await fetch("/api/via/vision", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ imageDataUrl: b64 }),
          }).then(r => r.json());
          onNotes(resp?.notes ?? "Image noted.");
          setBusy(false);
        }}
      />
      {busy && <span className="text-xs opacity-60">Analyzing…</span>}
    </div>
  );
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
