export type Section = 'style' | 'room'

export const QUESTION_SECTIONS: Record<string, Section> = {
  room_type: 'room',
  mood_words: 'style',
  style_primary: 'style',
  light_level: 'room',
  window_aspect: 'room',
  dark_stance: 'style',
  dark_locations: 'style',
  fixed_elements: 'room',
  fixed_details: 'room',
  anchors_keep: 'room',
  flow_targets: 'room',
  adjacent_primary_color: 'room',
  theme: 'room',
  constraints: 'room',
  avoid_colors: 'room',
  coordination_preference: 'room',
}

export function getSection(id: string): Section {
  return QUESTION_SECTIONS[id] || 'room'
}
