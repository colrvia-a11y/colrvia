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
  question_shown: { id: string; priority: 'P1' | 'P2' | 'P3' | 'P4' }
  answer_saved: { id: string; priority: 'P1' | 'P2' | 'P3' | 'P4' }
  question_dropped: { id: string; priority: 'P1' | 'P2' | 'P3' | 'P4'; reason: string }
  flow_capped: { id: string; priority: 'P1' | 'P2' | 'P3' | 'P4'; reason: string }
  intake_start: { template?: string }
  intake_submit: { fields: number }
  render_started: { story_id: string }
  render_complete: { story_id: string; ms?: number }
  reveal_action: { story_id: string; action: 'download_all' | 'share' | 'retry' | 'more_like' | 'compare_open' }
}

export type AnalyticsEventName = keyof AnalyticsEventMap
export type AnalyticsEventPayload<E extends AnalyticsEventName> = AnalyticsEventMap[E]
