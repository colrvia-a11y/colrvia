export interface AnalyticsEventMap {
  nav_click: { dest: string }
  designer_select: { designerId: string }
  start_portal_open: { href: string; skipped?: boolean }
  start_portal_nav: { href: string; ms: number }
  howitworks_open: { where: string }
  howitworks_modal_open: { origin: string }
  howitworks_modal_close: { origin: string; action: string; ms: number }
  howitworks_start: { where: 'modal' | 'page'; origin?: string; ms?: number }
  share_image_download: { id: string; variant: string }
  cinematic_play: { id: string }
  cinematic_exit: { id: string; seconds: number }
  explanation_view: { from: string; hasText: boolean }
  explanation_copy: { len: number }
  explanation_listen: { len: number }
  variant_open: { id: string; variant: string }
}

export type AnalyticsEventName = keyof AnalyticsEventMap
export type AnalyticsEventPayload<E extends AnalyticsEventName> = AnalyticsEventMap[E]
