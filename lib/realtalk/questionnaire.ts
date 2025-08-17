export type Choice = { value: string; label: string };
export type Question =
  | {
      id: "room_type" | "style_primary" | "lighting" | "brand";
      kind: "single";
      prompt: string;
      choices: Choice[];
      next: (a: Answers) => QuestionId;
      required?: true;
    }
  | {
      id: "mood_words";
      kind: "multi";
      prompt: string;
      choices: Choice[];
      next: (a: Answers) => QuestionId;
      required?: true;
      min?: number;
      max?: number;
    }
  | {
      id: "dark_color_ok";
      kind: "single";
      prompt: string;
      choices: Choice[];
      next: (a: Answers) => QuestionId;
      required?: true;
    }
  | {
      id: "fixed_elements" | "avoid_colors";
      kind: "free";
      prompt: string;
      placeholder?: string;
      next: (a: Answers) => QuestionId;
    };

export type QuestionId =
  | "room_type"
  | "lighting"
  | "style_primary"
  | "mood_words"
  | "dark_color_ok"
  | "fixed_elements"
  | "avoid_colors"
  | "brand"
  | "END";

export type Answers = Partial<{
  room_type: string;
  lighting: "Bright" | "Low" | "Mixed";
  style_primary: string;
  mood_words: string[];
  dark_color_ok: "Softer" | "Balanced" | "Bolder";
  fixed_elements: string;
  avoid_colors: string;
  brand: "Sherwin-Williams" | "Behr";
}>;

const nextAfterRoom = (a: Answers): QuestionId => "lighting";
const nextAfterLighting = (a: Answers): QuestionId => "style_primary";
const nextAfterStyle = (a: Answers): QuestionId => "mood_words";
const nextAfterMood = (a: Answers): QuestionId => "dark_color_ok";
const nextAfterContrast = (a: Answers): QuestionId => "fixed_elements";
const nextAfterFixed = (a: Answers): QuestionId => "avoid_colors";
const nextAfterAvoid = (a: Answers): QuestionId => "brand";

export const QUESTIONNAIRE: Question[] = [
  {
    id: "room_type",
    kind: "single",
    prompt: "Which space are we painting?",
    choices: [
      { value: "Living Room", label: "Living Room" },
      { value: "Bedroom", label: "Bedroom" },
      { value: "Kitchen", label: "Kitchen" },
      { value: "Bathroom", label: "Bathroom" },
      { value: "Office", label: "Office" },
      { value: "Entryway", label: "Entryway" },
    ],
    next: nextAfterRoom,
    required: true,
  },
  {
    id: "lighting",
    kind: "single",
    prompt: "How’s the natural light?",
    choices: [
      { value: "Bright", label: "Bright" },
      { value: "Mixed", label: "Mixed" },
      { value: "Low", label: "Low" },
    ],
    next: nextAfterLighting,
    required: true,
  },
  {
    id: "style_primary",
    kind: "single",
    prompt: "What’s the base style vibe?",
    choices: [
      { value: "Cozy Neutral", label: "Cozy Neutral" },
      { value: "Airy Coastal", label: "Airy Coastal" },
      { value: "Modern Warm", label: "Modern Warm" },
      { value: "Clean Minimal", label: "Clean Minimal" },
      { value: "Bold Color", label: "Bold Color" },
    ],
    next: nextAfterStyle,
    required: true,
  },
  {
    id: "mood_words",
    kind: "multi",
    prompt: "Pick a few mood words.",
    choices: [
      { value: "Calm", label: "Calm" },
      { value: "Fresh", label: "Fresh" },
      { value: "Warm", label: "Warm" },
      { value: "Cozy", label: "Cozy" },
      { value: "Crisp", label: "Crisp" },
      { value: "Playful", label: "Playful" },
    ],
    min: 1,
    max: 3,
    next: nextAfterMood,
    required: true,
  },
  {
    id: "dark_color_ok",
    kind: "single",
    prompt: "How bold should we go?",
    choices: [
      { value: "Softer", label: "Softer" },
      { value: "Balanced", label: "Balanced" },
      { value: "Bolder", label: "Bolder" },
    ],
    next: nextAfterContrast,
    required: true,
  },
  {
    id: "fixed_elements",
    kind: "free",
    prompt: "Any fixed elements (floors, countertops, brick) to respect?",
    placeholder: "e.g., red brick fireplace; oak floors; black sofa",
    next: nextAfterFixed,
  },
  {
    id: "avoid_colors",
    kind: "free",
    prompt: "Any colors you want to avoid?",
    placeholder: "e.g., no yellow; avoid blue-greens",
    next: nextAfterAvoid,
  },
  {
    id: "brand",
    kind: "single",
    prompt: "Preferred paint brand?",
    choices: [
      { value: "Sherwin-Williams", label: "Sherwin-Williams" },
      { value: "Behr", label: "Behr" },
    ],
    next: () => "END",
    required: true,
  },
];

export const firstQuestionId: QuestionId = "room_type";

export function getQuestionById(id: QuestionId): Question | undefined {
  return QUESTIONNAIRE.find(q => q.id === id);
}

export function nextIdFor(id: QuestionId, a: Answers): QuestionId {
  if (id === "END") return "END";
  const q = getQuestionById(id);
  return q ? q.next(a) : "END";
}
