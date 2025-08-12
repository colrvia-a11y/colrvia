"use client";
import React from "react";

export default function RevealPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Color Story</h1>
      <p className="text-sm text-neutral-600">Session ID: {params.id}</p>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Route A — Warm Minimal</h2>
        <ul className="text-sm list-disc pl-6">
          <li>Main (60%): high-LRV warm neutral suited to low/medium light</li>
          <li>Support (30%): softened hue that harmonizes existing floors</li>
          <li>Accent (10%): optional deeper anchor if dark comfort ≥ 3</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Route B — Fresh Coastal</h2>
        <ul className="text-sm list-disc pl-6">
          <li>Main (60%): crisp neutral balanced for north/east light</li>
          <li>Support (30%): gentle blue/green undertone for calm</li>
          <li>Accent (10%): contrast option for built-ins or island</li>
        </ul>
      </section>

      <div className="text-xs text-neutral-500">
        Sampling plan: test on poster boards, 2 coats, largest wall, daylight + evening, beside trim white.
      </div>
    </main>
  );
}
