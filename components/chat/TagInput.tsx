// components/chat/TagInput.tsx
"use client";
import { useState, KeyboardEvent } from "react";

export default function TagInput({
  values,
  onChange,
  placeholder,
  helper,
  min = 0,
  max = 99,
}: {
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  helper?: string;
  min?: number;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  function add(val: string) {
    const v = val.trim();
    if (!v) return;
    if (values.includes(v)) return;
    if (values.length >= max) return;
    onChange([...values, v]);
    setDraft("");
  }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-sm">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter(x => x !== v))}
              aria-label={`Remove ${v}`}
              className="opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        placeholder={placeholder ?? "Type and press Enter"}
        className="w-full rounded-2xl border border-black/10 px-4 py-3"
        aria-describedby={helper ? "tag-helper" : undefined}
      />
      {helper && <p id="tag-helper" className="text-xs opacity-70">{helper}</p>}
      <div className="text-xs opacity-60">{values.length}/{max}{min ? ` (min ${min})` : ""}</div>
    </div>
  );
}
