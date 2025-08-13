// lib/analytics/client.ts
"use client"
import type { PostHog } from "posthog-js"
import type { AnalyticsEventName, AnalyticsEventPayload } from "./types"

let ready = false
let q: Array<[AnalyticsEventName, any]> = []
let ph: PostHog | null = null

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com"

export function init() {
  if (ready || !KEY) return
  import("posthog-js").then(({ default: posthog }) => {
    try {
      posthog.init(KEY!, {
        api_host: HOST,
        capture_pageview: false,
        capture_pageleave: false,
        autocapture: false,
      })
      ph = (window as any).posthog as PostHog
      ready = true
      q.forEach(([n, p]) => ph?.capture(n, p))
      q = []
    } catch {
      /* noop */
    }
  }).catch(() => {})
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>) {
  if (!KEY) return // feature-flag off
  if (!ready) {
    q.push([name, props])
    init()
    return
  }
  try { ph?.capture(name, props) } catch { /* noop */ }
}
