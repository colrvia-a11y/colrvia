"use client";
import React from "react";

/** Shows a subtle animated edge glow when `active` is true. */
export default function GlowFrame({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-40">
        <div className="absolute inset-2 rounded-[24px]">
          <div
            className="absolute inset-0 rounded-[24px] opacity-70"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, #8be0c1, #c9f0dd, #a3c4ff, #e3d7ff, #8be0c1)",
              filter: "blur(18px)",
              animation: "colrvia-spin 7s linear infinite",
              WebkitMask:
                "radial-gradient(closest-side, rgba(0,0,0,0) 97%, rgba(0,0,0,1) 98%)",
              mask:
                "radial-gradient(closest-side, rgba(0,0,0,0) 97%, rgba(0,0,0,1) 98%)",
            }}
          />
        </div>
      </div>
      <style jsx global>{`
        @keyframes colrvia-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
