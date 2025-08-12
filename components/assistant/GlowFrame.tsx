"use client";
import React from "react";

/** Shows a peach Siri-style edge glow when `active` is true. */
export default function GlowFrame({ active }: { active: boolean }) {
  if (!active) return null;

  const peach = "#f2b897"; // CTA peach from home page

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40">
        <div className="absolute inset-2 rounded-[24px] border-2 glow-frame-peach" />
      </div>
      <style jsx global>{`
        .glow-frame-peach {
          border-color: ${peach};
          box-shadow:
            0 0 40px rgba(242, 184, 151, 0.45),
            inset 0 0 20px rgba(242, 184, 151, 0.35);
          animation: glowPeachPulse 2.5s ease-in-out infinite;
        }
        @keyframes glowPeachPulse {
          0%, 100% {
            box-shadow:
              0 0 40px rgba(242, 184, 151, 0.45),
              inset 0 0 20px rgba(242, 184, 151, 0.35);
          }
          50% {
            box-shadow:
              0 0 80px rgba(242, 184, 151, 0.8),
              inset 0 0 40px rgba(242, 184, 151, 0.6);
          }
        }
      `}</style>
    </>
  );
}
