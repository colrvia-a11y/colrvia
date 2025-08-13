"use client";

import { useState } from "react";
import OnboardingChat from "@/components/ai/OnboardingChat";
import { DEFAULT_DESIGNER_ID } from "@/lib/ai/designers";

export default function IntakePage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 flex flex-col items-center gap-6">
      {showChat ? (
        <OnboardingChat designerId={DEFAULT_DESIGNER_ID} />
      ) : (
        <button
          type="button"
          onClick={() => setShowChat(true)}
          className="btn btn-primary text-lg px-6 py-4"
        >
          Talk to designer
        </button>
      )}
    </main>
  );
}
