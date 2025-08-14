export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { buildQuestionQueue } from '@/lib/intake/engine'
import type { Answers } from '@/lib/intake/types'
import type { QuestionId } from '@/lib/intake/questions'
import type { IntakeTurnT } from '@/lib/model-schema'
import { ackFor } from '@/lib/ai/phrasing'
import { nluParse } from '@/lib/intake/nlu'

const GREETINGS: Record<string, string> = {
  therapist: "Hello! I’m Moss, your Color Therapist. Let’s get started.",
  minimalist: "Hello! I’m Moss, your Minimalist guide. Let’s begin.",
  naturalist: "Hello! I’m Moss, your Cozy Naturalist. Let’s get started.",
}

type Prompt = {
  text: string
  input_type: IntakeTurnT['input_type']
  choices?: string[] | null
  validation?: IntakeTurnT['validation']
}

const PROMPTS: Record<QuestionId, Prompt> = {
  room_type: {
    text: 'Which space are we designing? (e.g. Living Room, Kitchen, Bedroom…) ',
    input_type: 'singleSelect',
    choices: [
      'Living Room',
      'Kitchen',
      'Bedroom',
      "Kid's Room",
      'Nursery',
      'Dining Room',
      'Home Office',
      'Bathroom',
      'Open Concept',
      'Hallway/Entry',
      'Other',
    ],
    validation: { required: true },
  },
  mood_words: {
    text: 'In three words, how should this room feel?',
    input_type: 'text',
    validation: { required: true, max: 3 },
  },
  style_primary: {
    text: 'Which style resonates most with you?',
    input_type: 'singleSelect',
    choices: [
      'Modern Minimalist',
      'Organic Cottage',
      'Moody Traditional',
      'Japandi',
      'Scandinavian',
      'Industrial',
      'Bohemian',
      'Coastal',
      'Mid-Century',
      'Transitional',
      'Not sure',
    ],
    validation: { required: true },
  },
  light_level: {
    text: 'How much natural light does the room get?',
    input_type: 'singleSelect',
    choices: ['Bright', 'Mixed', 'Low', 'Not sure'],
    validation: { required: true },
  },
  window_aspect: {
    text: 'Which direction do the windows face?',
    input_type: 'singleSelect',
    choices: ['North', 'East', 'South', 'West', 'Not sure'],
  },
  dark_stance: {
    text: 'How do you feel about dark paint?',
    input_type: 'singleSelect',
    choices: [
      'Avoid dark paint',
      'Maybe an accent wall',
      'Trim or accents only',
      'Open to dark anywhere',
      'Not sure',
    ],
    validation: { required: true },
  },
  dark_locations: {
    text: 'Where would you use dark paint?',
    input_type: 'multiSelect',
    choices: ['Walls', 'Trim', 'Ceiling', 'Cabinetry', 'Doors', 'Island', 'Not sure'],
  },
  fixed_elements: {
    text: 'Any fixed elements to consider in this room?',
    input_type: 'multiSelect',
    choices: [
      'Flooring',
      'Cabinetry',
      'Counters',
      'Backsplash',
      'Fireplace',
      'Ceiling beams',
      'Built-ins',
      'Furniture',
      'Appliances',
      'Not sure',
    ],
  },
  fixed_details: {
    text: 'Any details about those elements?',
    input_type: 'text',
  },
  anchors_keep: {
    text: 'Which anchors will remain in the space?',
    input_type: 'text',
  },
  flow_targets: {
    text: 'Which nearby rooms should coordinate?',
    input_type: 'multiSelect',
    choices: ['Kitchen', 'Dining', 'Living', 'Hallway', 'Bedroom', 'Bathroom', 'Other', 'Not sure'],
  },
  adjacent_primary_color: {
    text: "What's the main color in the adjacent room?",
    input_type: 'singleSelect',
    choices: ['White/Neutral', 'Warm Neutrals', 'Cool Neutrals', 'Blue', 'Green', 'Red/Pink', 'Yellow', 'Other', 'Not sure'],
  },
  theme: { text: 'Any theme or inspiration for the room?', input_type: 'text' },
  constraints: {
    text: 'Any constraints we should know?',
    input_type: 'multiSelect',
    choices: ['Kids/Pets', 'Renting', 'Low VOC', 'HOA rules', 'Color rules', 'Other'],
  },
  avoid_colors: { text: 'Any colors to avoid?', input_type: 'text' },
  coordination_preference: {
    text: 'How should colors coordinate across spaces?',
    input_type: 'singleSelect',
    choices: ['Shared palette throughout', 'Each room its own', 'Not sure'],
  },
}

function promptFor(id: QuestionId, answers: Answers): Prompt {
  const base = PROMPTS[id]
  if (id === 'fixed_elements') {
    const room = (answers.room_type || 'room').replace(/_/g, ' ')
    return { ...base, text: `Which ${room} elements need to coordinate with paint?` }
  }
  return base
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    answers?: Answers
    designerId?: string
    last_question?: QuestionId
    last_answer?: string
  }
  const designerId = body.designerId || 'therapist'
  const answers: Answers = body.answers || {}

  // NEW: normalize ALL provided answers so conditional logic sees canonical values.
  // Voice mode sends free-form text; we need to map it to enums/arrays consistently.
  const normalized: Answers = {} as any
  for (const key of Object.keys(answers) as QuestionId[]) {
    const raw: any = (answers as any)[key]
    // Only re-parse strings; arrays/objects already in canonical shape can pass through.
    normalized[key] = typeof raw === 'string' ? (nluParse as any)(key, raw) : raw
  }

  // Also re-apply the latest answer explicitly (this ensures it wins over any stale client value).
  if (body.last_question && body.last_answer !== undefined) {
    normalized[body.last_question] = nluParse(body.last_question, body.last_answer)
  }

  const queue = buildQuestionQueue(normalized)
  const nextId = queue[0]

  if (!nextId) return NextResponse.json({ turn: null })

  const info = promptFor(nextId, normalized)
  let questionText = info.text
  if (body.last_question && body.last_answer !== undefined) {
    const ack = ackFor(body.last_question, body.last_answer, designerId)
    questionText = `${ack} ${questionText}`
  } else if (body.last_answer !== undefined) {
    // If we have an answer but no matching question ID, fall back to a generic ack.
    const ack = ackFor(body.last_question ?? '', body.last_answer, 'seed')
    questionText = `${ack} ${questionText}`
  } else if (!body.last_question) {
    const greet = GREETINGS[designerId] || GREETINGS.therapist
    questionText = `${greet} ${questionText}`
  }

  const turn: IntakeTurnT = {
    field_id: nextId,
    next_question: questionText,
    input_type: info.input_type,
    choices: info.choices ?? null,
    validation: info.validation || null,
  }

  return NextResponse.json({ turn })
}

