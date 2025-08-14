export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { buildQuestionQueue } from "@/lib/intake/engine"
import type { Answers } from "@/lib/intake/types"
import type { IntakeTurnT } from "@/lib/model-schema"
import type { QuestionId } from "@/lib/intake/questions"

const PROMPTS: Record<QuestionId, { text: string; input_type: IntakeTurnT['input_type']; choices?: string[] | null }> = {
  room_type: { text: "Which room are you working on?", input_type: "text" },
  mood_words: { text: "Give a couple vibe words you like.", input_type: "text" },
  style_primary: { text: "How would you describe your style?", input_type: "text" },
  light_level: { text: "How much natural light does the room get?", input_type: "text" },
  window_aspect: { text: "Which direction do the windows face?", input_type: "text" },
  dark_stance: { text: "How do you feel about dark paint?", input_type: "text" },
  dark_locations: { text: "Where would you use dark paint?", input_type: "text" },
  fixed_elements: { text: "Any fixed elements to consider?", input_type: "text" },
  fixed_details: { text: "Any details about those elements?", input_type: "text" },
  anchors_keep: { text: "Which anchors will remain in the space?", input_type: "text" },
  flow_targets: { text: "Which nearby rooms should coordinate?", input_type: "text" },
  adjacent_primary_color: { text: "What's the main color in the adjacent room?", input_type: "text" },
  theme: { text: "Any theme or inspiration for the room?", input_type: "text" },
  constraints: { text: "Any constraints we should know?", input_type: "text" },
  avoid_colors: { text: "Any colors to avoid?", input_type: "text" },
  coordination_preference: {
    text: "How should colors coordinate across spaces?",
    input_type: "text",
  },
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { answers?: Answers }
  const answers: Answers = body.answers || {}
  const queue = buildQuestionQueue(answers)
  const nextId = queue[0]
  if (!nextId) return NextResponse.json({ turn: null })
  const info = PROMPTS[nextId]
  const turn: IntakeTurnT = {
    field_id: nextId,
    next_question: info.text,
    input_type: info.input_type,
    choices: info.choices ?? null,
  }
  return NextResponse.json({ turn })
}

