export const QUESTION_SECTIONS: Record<string, 'style' | 'room'> = {
  style_primary: 'style',
  mood_words: 'style',
  dark_stance: 'style',
  dark_locations: 'style',
  room_type: 'room',
  light_level: 'room',
  window_aspect: 'room',
};

// Helper for ids not explicitly listed: modules like K*, B*, L*, N*, H*, O*, C* are all room
export function getSection(id: string): 'style' | 'room' {
  return (
    QUESTION_SECTIONS[id] || (/^[KBLNHOC]/.test(id) ? 'room' : 'style')
  );
}
