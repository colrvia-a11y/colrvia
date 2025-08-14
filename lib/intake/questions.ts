export type Priority = 'P1' | 'P2' | 'P3' | 'P4'

export const QUESTION_PRIORITY = {
  room_type: 'P1',
  mood_words: 'P1',
  style_primary: 'P1',
  light_level: 'P1',
  window_aspect: 'P3',
  dark_stance: 'P1',
  dark_locations: 'P3',
  fixed_elements: 'P1',
  fixed_details: 'P4',
  anchors_keep: 'P1',
  flow_targets: 'P1',
  adjacent_primary_color: 'P3',
  theme: 'P1',
  constraints: 'P2',
  avoid_colors: 'P3',
  coordination_preference: 'P4',
} as const

export type QuestionId = keyof typeof QUESTION_PRIORITY
