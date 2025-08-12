import { describe, it, expect, vi } from 'vitest'
import { buildQuestionQueue, enforceCap } from '@/lib/intake/engine'
import type { Answers } from '@/lib/intake/types'
import { track } from '@/lib/analytics'

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))

describe('buildQuestionQueue', () => {
  it('nursery shortest path', () => {
    const q = buildQuestionQueue({ room_type: 'nursery' })
    expect(q).toEqual([
      'room_type','mood_words','style_primary','light_level','dark_stance','n_theme_keepers','constraints'
    ])
  })

  it('kitchen medium path', () => {
    const answers: Answers = {
      room_type: 'kitchen',
      light_level: 'varies',
      dark_stance: 'walls',
      fixed_elements: ['ctops','backsplash']
    }
    const q = buildQuestionQueue(answers)
    expect(q).toEqual([
      'room_type','mood_words','style_primary','light_level','window_aspect','dark_stance','dark_locations','k_fixed_elements','k_fixed_details','constraints'
    ])
  })

  it('hallway path', () => {
    const q = buildQuestionQueue({ room_type: 'hallway_entry', flow_targets: ['kitchen'] })
    expect(q).toEqual([
      'room_type','mood_words','style_primary','light_level','dark_stance','h_flow_targets','h_adjacent_color','constraints'
    ])
  })

  it('open concept long path', () => {
    const answers: Answers = {
      room_type: 'open_concept',
      light_level: 'varies',
      dark_stance: 'walls',
      fixed_elements: ['wood_floor','fireplace'],
      constraints: ['color_rules']
    }
    const q = buildQuestionQueue(answers)
    expect(q).toEqual([
      'room_type','mood_words','style_primary','light_level','window_aspect','dark_stance','dark_locations','o_anchors_keep','l_anchors_keep','l_fixed_details','o_coordination_preference','constraints','avoid_colors'
    ])
    expect(q.length).toBeLessThanOrEqual(15)
  })

  it('enforces hard cap drop order', () => {
    vi.clearAllMocks()
    const queue = [
      'room_type','mood_words','style_primary','light_level','dark_stance',
      'k_fixed_elements','b_fixed_elements','l_anchors_keep','h_flow_targets','constraints',
      'avoid_colors','o_anchors_keep','n_theme_keepers','k_fixed_elements','b_fixed_elements',
      'k_fixed_details','b_fixed_details','l_fixed_details','o_coordination_preference','dark_locations','window_aspect','h_adjacent_color'
    ]
    const capped = enforceCap([...queue])
    expect(capped.length).toBeLessThanOrEqual(15)
    const order = (track as unknown as vi.Mock).mock.calls
      .filter(c => c[0] === 'question_dropped')
      .map(c => c[1].id)
    expect(order).toEqual([
      'k_fixed_details','b_fixed_details','l_fixed_details','o_coordination_preference','dark_locations','window_aspect','h_adjacent_color'
    ])
    const flow = (track as unknown as vi.Mock).mock.calls.find(c => c[0] === 'flow_capped')
    expect(flow).toBeTruthy()
  })
})
