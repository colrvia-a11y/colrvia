import { Answers } from './types'
import { getSection } from './sections'
import { QuestionId, QUESTION_PRIORITY } from './questions'
import { track } from '@/lib/analytics'

function isAnswered(a: Answers, id: QuestionId): boolean {
  switch (id) {
    case 'theme':
      return a.theme !== undefined || a.keepers !== undefined
    case 'fixed_details':
      return a.fixed_details !== undefined
    default:
      return a[id] !== undefined
  }
}

function pushIfUnanswered(q: QuestionId[], a: Answers, id: QuestionId) {
  if (!isAnswered(a, id)) q.push(id)
}

export function capByPriority(q: QuestionId[], a: Answers) {
  const MAX = 15
  const DROP_ORDER: QuestionId[] = [
    'fixed_details',
    'coordination_preference',
    'dark_locations',
    'window_aspect',
    'adjacent_primary_color',
  ]
  if (q.length <= MAX) return
  for (const id of DROP_ORDER) {
    const idx = q.indexOf(id)
    if (idx !== -1 && q.length > MAX) {
      q.splice(idx, 1)
      const priority = QUESTION_PRIORITY[id]
      track?.('question_dropped', { id, priority, reason: 'cap' })
      track?.('flow_capped', { id, priority, reason: 'cap' })
    }
  }
  while (q.length > MAX) {
    const id = q.pop() as QuestionId
    const priority = QUESTION_PRIORITY[id]
    track?.('question_dropped', { id, priority, reason: 'cap' })
    track?.('flow_capped', { id, priority, reason: 'cap' })
  }
}

export function buildQuestionQueue(a: Answers): QuestionId[] {
  const q: QuestionId[] = []

  // Base P1
  pushIfUnanswered(q, a, 'room_type')
  pushIfUnanswered(q, a, 'mood_words')
  pushIfUnanswered(q, a, 'style_primary')
  pushIfUnanswered(q, a, 'light_level')
  if (a.light_level === 'varies') pushIfUnanswered(q, a, 'window_aspect')
  pushIfUnanswered(q, a, 'dark_stance')

  // Room modules
  switch (a.room_type) {
    case 'kitchen':
    case 'bathroom':
    case 'living_room':
    case 'bedroom_adult':
    case 'dining':
    case 'home_office':
    case 'open_concept':
      pushIfUnanswered(q, a, 'fixed_elements')
      if (Array.isArray(a.fixed_elements) && a.fixed_elements.length >= 2)
        pushIfUnanswered(q, a, 'fixed_details')
      break
    case 'bedroom_kid':
    case 'nursery':
      pushIfUnanswered(q, a, 'theme')
      break
    case 'hallway_entry':
      pushIfUnanswered(q, a, 'flow_targets')
      if (Array.isArray(a.flow_targets) && a.flow_targets.length >= 1)
        pushIfUnanswered(q, a, 'adjacent_primary_color')
      break
  }

  if (a.room_type === 'open_concept') {
    pushIfUnanswered(q, a, 'anchors_keep')
    pushIfUnanswered(q, a, 'coordination_preference')
  }

  // Constraints
  pushIfUnanswered(q, a, 'constraints')
  if (Array.isArray(a.constraints) && a.constraints.includes('color_rules'))
    pushIfUnanswered(q, a, 'avoid_colors')

  if (a.dark_stance && a.dark_stance !== 'avoid')
    pushIfUnanswered(q, a, 'dark_locations')

  capByPriority(q, a)

  const style: QuestionId[] = []
  const room: QuestionId[] = []
  for (const id of q) {
    ;(getSection(id) === 'style' ? style : room).push(id)
  }
  return [...style, ...room]
}
