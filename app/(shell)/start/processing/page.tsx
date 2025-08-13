"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { moss } from "@/lib/ai/phrasing";
import { createPaletteFromInterview } from "@/lib/palette";

export default function ProcessingPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      const { id } = await createPaletteFromInterview();
      router.replace(`/reveal/${id}`);
    })();
  }, [router]);

  return (
    <main className="max-w-xl mx-auto px-4 py-20 text-center">
      <p>{moss.working()}</p>
    </main>
  );
}
