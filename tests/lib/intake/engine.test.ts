import { buildQuestionQueue, capByPriority } from '@/lib/intake/engine'

describe('buildQuestionQueue', () => {
  it('orders style questions before room questions', () => {
    const q = buildQuestionQueue({})
    expect(q.slice(0,4)).toEqual(['style_primary','mood_words','dark_stance','room_type'])
  })

  it('includes dark_locations when stance triggers', () => {
    const q = buildQuestionQueue({ dark_stance: 'walls' })
    expect(q[2]).toBe('dark_locations')
  })
})

describe('capByPriority', () => {
  it('drops items in priority order to enforce cap', () => {
    const q = ['style_primary','mood_words','dark_stance','dark_locations','room_type','light_level','window_aspect','K1','K1a','B1a','L1a','O2','constraints','avoid_colors','adjacent_primary_color','extra1','extra2']
    capByPriority(q, {})
    expect(q.length).toBe(15)
    expect(q).not.toContain('K1a')
    expect(q).not.toContain('B1a')
    expect(q).toContain('dark_locations')
    expect(q).toContain('window_aspect')
  })
})
