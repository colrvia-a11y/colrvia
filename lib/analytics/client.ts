import type { AnalyticsEventName, AnalyticsEventPayload } from "./types";

export function init() {
  /* no-op client init */
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>) {
  if (typeof window === "undefined") return
  console.debug('[analytics]', name, props)
  if ((window as any).posthog) (window as any).posthog.capture(name, props)
}
