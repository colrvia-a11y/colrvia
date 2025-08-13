import type { AnalyticsEventName, AnalyticsEventPayload } from "./types";

export function init() {
  /* no-op client init */
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>) {
  if (typeof window !== "undefined" && (window as any).posthog) (window as any).posthog.capture(name, props);
}
