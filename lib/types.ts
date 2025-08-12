export type InputType =
  | "singleSelect"
  | "multiSelect"
  | "slider"
  | "upload"
  | "yesNo"
  | "text";

export interface Followup {
  show_if: Record<string, unknown>;
  ask: string;
  input_type: InputType;
  choices?: string[];
}

export interface IntakeTurn {
  next_question: string;
  input_type: InputType;
  choices?: string[];
  explain_why?: string;
  state_updates?: Record<string, unknown>;
  followups?: Followup[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export type RoomType =
  | "Foyer"
  | "Living"
  | "Dining"
  | "Kitchen"
  | "Pantry"
  | "Breakfast Nook"
  | "Bedroom"
  | "Kid's Room"
  | "Nursery"
  | "Home Office"
  | "Bathroom"
  | "Powder Room"
  | "Laundry/Mudroom"
  | "Hallway"
  | "Stairwell"
  | "Loft/Bonus"
  | "Media Room"
  | "Sunroom"
  | "Basement"
  | "Gym"
  | "Closet"
  | "Garage"
  | "Other";

export interface SessionState {
  user_id?: string;
  room_type?: RoomType;
  answers: Record<string, unknown>;
  photos: string[]; // urls or storage ids
  progress: number; // 0–100
  palette_hypotheses: Array<{ id: string; label: string; rationale: string }>;
  constraints: Record<string, unknown>;
}
