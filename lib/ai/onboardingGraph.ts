// Deterministic finite state graph for onboarding conversation
// Provides: next(state, userInput) and initial state nodes with prompts
export type OnboardingStateId =
  | 'start'
  | 'ask-goal'
  | 'ask-room'
  | 'ask-light'
  | 'ask-brand'
  | 'summary'
  | 'done';

export interface OnboardingState {
  id: OnboardingStateId;
  prompt: string; // what designer asks
  field?: keyof OnboardingAnswers;
  next?: (answers: OnboardingAnswers) => OnboardingStateId;
}

export interface OnboardingAnswers {
  goal?: string;
  room?: string;
  lighting?: string;
  brand?: 'SW' | 'Behr';
}

export interface Turn {
  state: OnboardingStateId;
  prompt: string;
  answer?: string;
}

export const states: Record<OnboardingStateId, OnboardingState> = {
  start: {
    id: 'start',
    prompt: 'Hey! We will build a color story. Cool if I ask a few quick questions? (yes)'
  },
  'ask-goal': {
    id: 'ask-goal',
    prompt: 'What feeling or vibe are you after? (e.g. Cozy Neutral, Airy Coastal, Moody Blue-Green)',
    field: 'goal'
  },
  'ask-room': {
    id: 'ask-room',
    prompt: 'Which room or space are we focusing on first?',
    field: 'room'
  },
  'ask-light': {
    id: 'ask-light',
    prompt: 'How would you describe the natural light? (e.g. bright north, soft morning, low, mixed)',
    field: 'lighting'
  },
  'ask-brand': {
    id: 'ask-brand',
    prompt: 'Paint brand preference? (SW or Behr)',
    field: 'brand'
  },
  summary: {
    id: 'summary',
    prompt: 'Got it. Generating your starter palette...'
  },
  done: {
    id: 'done',
    prompt: 'All set. Opening your design.'
  }
};

export function initialTurn(): Turn { return { state: 'start', prompt: states.start.prompt }; }

export function nextState(current: OnboardingStateId, answer: string, a: OnboardingAnswers): { next: OnboardingStateId; update?: Partial<OnboardingAnswers> } {
  switch (current) {
    case 'start':
      return { next: 'ask-goal' };
    case 'ask-goal':
      return { next: 'ask-room', update: { goal: answer } };
    case 'ask-room':
      return { next: 'ask-light', update: { room: answer } };
    case 'ask-light':
      return { next: 'ask-brand', update: { lighting: answer } };
    case 'ask-brand':
      return { next: 'summary', update: { brand: /behr/i.test(answer) ? 'Behr' : 'SW' } };
    case 'summary':
      return { next: 'done' };
    default:
      return { next: 'done' };
  }
}

export function isTerminal(id: OnboardingStateId) { return id === 'done'; }
