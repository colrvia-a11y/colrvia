export type RoomType =
  | 'living_room' | 'kitchen' | 'bedroom_adult' | 'bedroom_kid' | 'nursery'
  | 'bathroom' | 'dining' | 'home_office' | 'hallway_entry' | 'open_concept';

export type LightLevel = 'bright' | 'moderate' | 'low' | 'varies';
export type WindowAspect = 'north' | 'south' | 'east' | 'west' | 'multiple' | 'unknown';
export type DarkStance = 'walls' | 'accents' | 'avoid' | 'open';

export type ConstraintKey = 'kids_pets' | 'renting' | 'hoa' | 'low_voc' | 'color_rules' | 'budget';
export type DarkLocation = 'all_walls' | 'accent_wall' | 'ceiling' | 'trim_doors' | 'cabinetry' | 'designer_suggest';

export type FixedElement =
  | 'ctops' | 'backsplash' | 'cabinets' | 'flooring' | 'appliances'
  | 'vanity_top' | 'tile' | 'fixtures_finish' | 'bath_flooring'
  | 'wood_floor' | 'fireplace' | 'builtins_trim' | 'major_furniture' | 'rugs_textiles' | 'artwork'
  | 'none';

export type AnchorOpenConcept = 'dark_floor' | 'stone' | 'metal' | 'large_sofa_rug' | 'none';

export interface Answers {
  room_type?: RoomType;
  mood_words?: string[];          // up to 3
  style_primary?: string;         // from list or 'mix'
  light_level?: LightLevel;
  window_aspect?: WindowAspect;   // only if varies
  dark_stance?: DarkStance;
  dark_locations?: DarkLocation[]; // if stance != 'avoid'
  fixed_elements?: FixedElement[]; // room-specific
  fixed_details?: Record<string, string>; // key per element: material/tone/undertone/color
  anchors_keep?: AnchorOpenConcept[]; // open concept
  flow_targets?: string[];        // hallway adjacency labels
  adjacent_primary_color?: string;
  theme?: string;                 // nursery/kids
  keepers?: string[];             // nursery/kids (crib/rug/etc.)
  constraints?: ConstraintKey[];
  avoid_colors?: string[];        // if color_rules
  uploads?: string[];             // file ids/urls; never counted as a question
}

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type QuestionId =
  | 'room_type'
  | 'mood_words'
  | 'style_primary'
  | 'light_level'
  | 'window_aspect'
  | 'dark_stance'
  | 'dark_locations'
  | 'k_fixed_elements'
  | 'k_fixed_details'
  | 'b_fixed_elements'
  | 'b_fixed_details'
  | 'l_anchors_keep'
  | 'l_fixed_details'
  | 'n_theme_keepers'
  | 'h_flow_targets'
  | 'h_adjacent_color'
  | 'o_anchors_keep'
  | 'o_coordination_preference'
  | 'constraints'
  | 'avoid_colors';
