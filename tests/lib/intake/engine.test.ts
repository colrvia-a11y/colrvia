import { buildQuestionQueue, capByPriority } from '@/lib/intake/engine'
import { getSection } from '@/lib/intake/sections'

describe('buildQuestionQueue', () => {
  it('reordered queue groups style before room', () => {
    const q = buildQuestionQueue({
      dark_stance: 'walls',
      light_level: 'varies',
      room_type: 'kitchen',
      constraints: ['color_rules'],
    })
    const firstRoom = q.findIndex(id => getSection(id) === 'room')
    expect(firstRoom).toBeGreaterThan(-1)
    expect(q.slice(0, firstRoom).every(id => getSection(id) === 'style')).toBe(true)
    expect(q.slice(firstRoom).every(id => getSection(id) === 'room')).toBe(true)
  })

  it('includes dark_locations when stance triggers', () => {
    const q = buildQuestionQueue({ dark_stance: 'walls' })
    expect(q[2]).toBe('dark_locations')
  })
})

describe('capByPriority', () => {
  it('cap drop order unchanged', () => {
    const q = [
      'style_primary','mood_words','dark_stance','dark_locations','room_type','light_level',
      'window_aspect','K1','K1a','B1a','L1a','O2','constraints','avoid_colors','adjacent_primary_color','extra1','extra2'
    ]
    capByPriority(q, {})
    expect(q).toEqual([
      'style_primary','mood_words','dark_stance','dark_locations','room_type','light_level',
      'window_aspect','K1','L1a','O2','constraints','avoid_colors','adjacent_primary_color','extra1','extra2'
    ])
  })
})
