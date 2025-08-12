import type { PostHog } from 'posthog-js'
import type { AnalyticsEventName, AnalyticsEventPayload } from './analytics/events'

let client: PostHog | null = null
const QUEUE_KEY = 'ph_queue'

type QueuedEvent = { name: AnalyticsEventName; props: any }

function readQueue(): QueuedEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? JSON.parse(raw) as QueuedEvent[] : []
  } catch {
    return []
  }
}

function writeQueue(q: QueuedEvent[]) {
  if (typeof window === 'undefined') return
  try {
    if (q.length) localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
    else localStorage.removeItem(QUEUE_KEY)
  } catch {
    /* noop */
  }
}

function enqueue<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>) {
  const q = readQueue()
  q.push({ name, props })
  writeQueue(q)
}

function flushQueue() {
  if (!client || typeof window === 'undefined' || !navigator.onLine) return
  const q = readQueue()
  q.forEach(evt => {
    try { client!.capture(evt.name, evt.props) } catch { /* noop */ }
  })
  writeQueue([])
}

export function initAnalytics(){
  if(typeof window === 'undefined') return
  if(client) return client
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if(!key) return null
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  // dynamic import to avoid SSR
  import('posthog-js').then(m=>{
    m.default.init(key, { api_host: host, capture_pageview: false })
    client = m.default
    flushQueue()
  })
  window.addEventListener('online', flushQueue)
  navigator.serviceWorker?.addEventListener('message', e => {
    if (e.data === 'online') flushQueue()
  })
  return client
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>){
  if(typeof window === 'undefined') return
  if(!client || !navigator.onLine){
    enqueue(name, props)
    initAnalytics()
    return
  }
  client.capture(name, props)
}
export function identify(id:string, email?:string){ if(!client) return; client.identify(id, email? { email }: undefined)}
export function setProps(props: Record<string,any>){ if(!client) return; client.register(props) }
