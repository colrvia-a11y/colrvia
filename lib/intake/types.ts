export type RoomType =
  | 'living_room' | 'kitchen' | 'bedroom_adult' | 'bedroom_kid' | 'nursery'
  | 'bathroom' | 'dining' | 'home_office' | 'hallway_entry' | 'open_concept'

export type LightLevel = 'bright' | 'moderate' | 'low' | 'varies'
export type WindowAspect = 'north' | 'south' | 'east' | 'west' | 'multiple' | 'unknown'
export type DarkStance = 'walls' | 'accents' | 'avoid' | 'open'

export type ConstraintKey =
  | 'kids_pets' | 'renting' | 'hoa' | 'low_voc' | 'color_rules' | 'budget'
export type DarkLocation =
  | 'all_walls' | 'accent_wall' | 'ceiling' | 'trim_doors' | 'cabinetry' | 'designer_suggest'

export type FixedElement =
  | 'ctops' | 'backsplash' | 'cabinets' | 'flooring' | 'appliances'
  | 'vanity_top' | 'tile' | 'fixtures_finish' | 'bath_flooring'
  | 'wood_floor' | 'fireplace' | 'builtins_trim' | 'major_furniture' | 'rugs_textiles' | 'artwork'

export type AnchorOpenConcept = 'dark_floor' | 'stone' | 'metal' | 'large_sofa_rug' | 'none'

export interface Answers {
  room_type?: RoomType
  mood_words?: string[]
  style_primary?: string
  light_level?: LightLevel
  window_aspect?: WindowAspect
  dark_stance?: DarkStance
  dark_locations?: DarkLocation[]
  fixed_elements?: FixedElement[]
  fixed_details?: Record<string, string>
  anchors_keep?: AnchorOpenConcept[]
  flow_targets?: string[]
  adjacent_primary_color?: string
  theme?: string
  keepers?: string[]
  constraints?: ConstraintKey[]
  avoid_colors?: string[]
  uploads?: string[]
  coordination_preference?: string
  [key: string]: any
}
