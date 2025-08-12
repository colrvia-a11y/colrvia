export type InputType =
  | "singleSelect"
  | "multiSelect"
  | "slider"
  | "upload"
  | "yesNo"
  | "text";

export type Op = "==" | "!=" | ">=" | "<=" | ">" | "<" | "truthy" | "falsy";

export interface ShowIfCond {
  field: string;
  op: Op;
  value: unknown;
}

export interface Followup {
  field_id: string;
  ask: string;
  input_type: InputType;
  choices?: string[] | null;
  conditions: ShowIfCond[]; // all must pass
}

export interface IntakeTurn {
  field_id: string; // where the user's next answer should be saved
  next_question: string;
  input_type: InputType;
  choices?: string[] | null;
  explain_why?: string | null;
  followups?: Followup[] | null;
  validation?: {
    required?: boolean | null;
    min?: number | null;
    max?: number | null;
    pattern?: string | null;
  } | null;
}

export type RoomType =
  | "Foyer" | "Living" | "Dining" | "Kitchen" | "Pantry" | "Breakfast Nook"
  | "Bedroom" | "Kid's Room" | "Nursery" | "Home Office" | "Bathroom"
  | "Powder Room" | "Laundry/Mudroom" | "Hallway" | "Stairwell" | "Loft/Bonus"
  | "Media Room" | "Sunroom" | "Basement" | "Gym" | "Closet" | "Garage" | "Other";

export interface SessionState {
  user_id?: string;
  room_type?: RoomType;
  answers: Record<string, unknown>;
  photos: string[];
  progress: number;
  palette_hypotheses: Array<{ id: string; label: string; rationale: string }>;
  constraints: Record<string, unknown>;
}
