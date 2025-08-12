import type { PostHog } from 'posthog-js'
import type { AnalyticsEventName, AnalyticsEventPayload } from './analytics/events'

let client: PostHog | null = null

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
  })
  return client
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventPayload<E>){
  if(!client) return
  client.capture(name, props)
}
export function identify(id:string, email?:string){ if(!client) return; client.identify(id, email? { email }: undefined)}
export function setProps(props: Record<string,any>){ if(!client) return; client.register(props) }
