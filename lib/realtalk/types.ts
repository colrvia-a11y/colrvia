export type InputType = 'singleSelect' | 'multiSelect' | 'text';

export type Validation = {
  required?: boolean;
  max?: number; // e.g., mood_words clamped to 3 words
};

export type PromptChoice = {
  id: string;        // normalized value the backend expects
  label: string;     // display label
};

export type PromptSpec = {
  id: string;             // QuestionId (e.g., "room_type")
  text: string;           // Display prompt
  input_type: InputType;  // singleSelect | multiSelect | text
  choices?: PromptChoice[];
  validation?: Validation;
  section?: 'style' | 'room'; // optional hint
};

export type Answers = Record<string, string | string[] | null>;

export type TurnResponse = {
  // next prompt to render; null means done
  prompt: PromptSpec | null;
  // server can echo normalized answers (after nluParse)
  answers: Answers;
  // friendly greeting/persona line when starting
  greeting?: string;
  // progress hint if backend wants to share it
  progress?: { asked: number; maxCap?: number };
};

export type TurnRequest = {
  answers: Answers;       // latest answers object
  ack?: { id: string; value: string | string[] }; // what user just answered
  mode?: 'next' | 'explain';
  explainFor?: string; // questionId to explain (when mode==='explain')
};
