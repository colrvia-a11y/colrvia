// lib/analytics/index.ts
// SSR-safe shim; dynamically loads client in browser
import type { AnalyticsEventName, AnalyticsEventPayload } from "./events"

let _track = <E extends AnalyticsEventName>(_name: E, _props: AnalyticsEventPayload<E>) => {}
if (typeof window !== "undefined") {
  import("./client").then(m => {
    _track = m.track
    m.init?.()
  }).catch(()=>{})
}
export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>) {
  try { _track(name, props) } catch { /* noop */ }
}
// Backwards compatibility for legacy imports
export function initAnalytics() { /* deprecated no-op */ }
