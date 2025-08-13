import React from "react";
import Link from "next/link";

export default function InterviewIntro() {
  return (
    <main className="max-w-xl mx-auto px-4 py-12 space-y-8 text-center">
      <h1 className="font-display text-4xl mb-4">Designer interview</h1>
      <p className="text-sm text-muted-foreground">Designer-led conversation · ~6 minutes · 6–8 quick questions.</p>
      <Link href="/start/interview" className="btn btn-primary mt-6">Start interview</Link>
    </main>
  );
}
