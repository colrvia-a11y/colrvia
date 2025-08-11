// lib/analytics/index.ts
// SSR-safe shim; dynamically loads client in browser
let _track = (_: string, __?: Record<string, any>) => {}
if (typeof window !== "undefined") {
  import("./client").then(m => {
    _track = m.track
    m.init?.()
  }).catch(()=>{})
}
export function track(name: string, props?: Record<string, any>) {
  try { _track(name, props) } catch { /* noop */ }
}
// Backwards compatibility for legacy imports
export function initAnalytics() { /* deprecated no-op */ }
