import { buildQuestionQueue, capByPriority } from '@/lib/intake/engine'
import type { QuestionId } from '@/lib/intake/questions'

describe('buildQuestionQueue', () => {
  it('nursery path asks theme', () => {
    const q = buildQuestionQueue({ room_type: 'nursery' })
    expect(q).toContain('theme')
    expect(q).not.toContain('fixed_elements')
  })

  it('kitchen path includes fixed elements', () => {
    const q = buildQuestionQueue({ room_type: 'kitchen' })
    expect(q).toContain('fixed_elements')
    expect(q).not.toContain('theme')
  })

  it('hallway follow-up added when targets selected', () => {
    const q = buildQuestionQueue({ room_type: 'hallway_entry', flow_targets: ['kitchen'] })
    expect(q).toContain('adjacent_primary_color')
  })

  it('open concept includes anchors and coordination', () => {
    const q = buildQuestionQueue({ room_type: 'open_concept' })
    expect(q).toContain('anchors_keep')
    expect(q).toContain('coordination_preference')
  })

  it('asks dark locations when stance not avoid', () => {
    const q = buildQuestionQueue({ dark_stance: 'walls' })
    expect(q).toContain('dark_locations')
  })

  it('skips dark locations when stance avoid', () => {
    const q = buildQuestionQueue({ dark_stance: 'avoid' })
    expect(q).not.toContain('dark_locations')
  })
})

describe('capByPriority', () => {
  it('drops in priority order', () => {
    const q = [
      'room_type',
      'mood_words',
      'style_primary',
      'light_level',
      'window_aspect',
      'dark_stance',
      'fixed_elements',
      'fixed_details',
      'anchors_keep',
      'coordination_preference',
      'constraints',
      'avoid_colors',
      'dark_locations',
      'adjacent_primary_color',
      'extra1',
      'extra2',
      'extra3',
      'extra4',
    ] as QuestionId[]
    capByPriority(q, {} as any)
    expect(q).toEqual([
      'room_type',
      'mood_words',
      'style_primary',
      'light_level',
      'window_aspect',
      'dark_stance',
      'fixed_elements',
      'anchors_keep',
      'constraints',
      'avoid_colors',
      'adjacent_primary_color',
      'extra1',
      'extra2',
      'extra3',
      'extra4',
    ])
  })
})
