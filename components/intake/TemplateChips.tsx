"use client";

type Template = { label: string; values: Record<string, any> };

export function TemplateChips({ templates, onApply }:{ templates: Template[]; onApply:(v:Template["values"])=>void }) {
  return (
    <div role="list" aria-label="Starter templates" className="flex flex-wrap gap-2 mb-3">
      {templates.map(t => (
        <button
          key={t.label}
          type="button"
          onClick={() => onApply(t.values)}
          className="rounded-full border px-3 py-1 text-sm hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
