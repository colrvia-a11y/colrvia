import * as React from "react";

export function EmptyState({ title, desc, ctaLabel, href }:{ title:string; desc:string; ctaLabel?:string; href?:string }) {
  return (
    <div className="text-center border rounded-xl p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{desc}</p>
      {href && ctaLabel && (
        <a href={href} className="inline-flex mt-4 rounded-xl px-4 py-2 border hover:bg-neutral-50">{ctaLabel}</a>
      )}
    </div>
  );
}
export function ErrorState({ title="Something went wrong", desc="Please try again.", action }:{ title?:string; desc?:string; action?:React.ReactNode }) {
  return (
    <div className="text-center border rounded-xl p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-600">{desc}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
