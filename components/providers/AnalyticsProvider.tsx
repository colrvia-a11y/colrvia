"use client";
import { useEffect } from "react";
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    (async () => {
      if (!(window as any).posthog) {
        const { default: posthog } = await import("posthog-js");
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          autocapture: true,
          capture_pageview: true,
          persistence: "localStorage",
        });
        (window as any).posthog = posthog;
      }
    })();
  }, []);
  return <>{children}</>;
}
