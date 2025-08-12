import type { InputType, RoomType } from "./types";

/**
 * Minimal condition format:
 * - Direct equality: { "room_type": "Kitchen" }
 * - Comparator: { "dark_comfort": { ">=": 3 } }
 * Your server's `next_required_fields(state)` should evaluate these.
 */

export type ShowIf = Record<string, unknown>;

export type FieldSpec = {
  id: string;
  input_type: InputType | "group";
  label?: string;
  helper?: string;
  options?: string[];
  min?: number;
  max?: number;
  multiple?: boolean; // for uploads
  show_if?: ShowIf;
  fields?: FieldSpec[]; // for "group"
};

export type Graph = {
  core: FieldSpec[];
  carryover: FieldSpec[];
  modules: Record<RoomType, FieldSpec[]>;
  subgroups: Record<string, FieldSpec>;
};

/* -------------------- Reusable subgroups -------------------- */

const METALS_GROUP: FieldSpec = {
  id: "metals_group",
  input_type: "group",
  label: "Metal finishes",
  fields: [
    {
      id: "metal_finishes",
      input_type: "multiSelect",
      label: "Metal finishes present or desired",
      options: ["Brass (warm)", "Bronze", "Nickel (cool)", "Chrome", "Black", "Mixed"],
    },
    { id: "mix_metals_ok", input_type: "yesNo", label: "Okay to mix metals?" },
  ],
};

const TILE_GROUP: FieldSpec = {
  id: "tile_group",
  input_type: "group",
  label: "Tile / stone",
  fields: [
    {
      id: "tile_material",
      input_type: "singleSelect",
      label: "Tile/stone material",
      options: ["Ceramic", "Porcelain", "Natural stone", "Terrazzo", "Glass", "Other"],
    },
    {
      id: "tile_finish",
      input_type: "singleSelect",
      label: "Finish",
      options: ["Matte", "Satin", "Gloss", "Honed", "Polished"],
    },
    { id: "grout_color", input_type: "text", label: "Grout color (if known)" },
    { id: "tile_photo", input_type: "upload", label: "Tile/stone close-up (with white paper)", multiple: true },
  ],
};

const CABINETRY_GROUP: FieldSpec = {
  id: "cabinetry_group",
  input_type: "group",
  label: "Cabinetry",
  fields: [
    {
      id: "cabs_state",
      input_type: "singleSelect",
      label: "Cabinetry",
      options: ["Existing—painted", "Existing—stained", "New—painted", "New—stained"],
    },
    {
      id: "cabs_species",
      input_type: "singleSelect",
      label: "Wood species (if stained)",
      options: ["Oak", "Maple", "Walnut", "Birch", "Cherry", "Pine", "Unknown", "N/A"],
    },
    {
      id: "cabs_undertone",
      input_type: "singleSelect",
      label: "Undertone (visual)",
      options: ["Neutral", "Yellow", "Orange", "Red", "Pink", "Green", "Blue", "Gray/Brown"],
    },
    { id: "cabs_style", input_type: "singleSelect", label: "Door style", options: ["Shaker", "Slab", "Raised panel", "Other"] },
    { id: "cabs_photo", input_type: "upload", label: "Cabinet close-up (with white paper)", multiple: true },
  ],
};

const TEXTILES_GROUP: FieldSpec = {
  id: "textiles_group",
  input_type: "group",
  label: "Key textiles",
  fields: [
    { id: "textiles_headboard", input_type: "text", label: "Headboard / primary fabric (color/material)" },
    { id: "textiles_bedding", input_type: "text", label: "Bedding palette (main + accent)" },
    { id: "textiles_rug", input_type: "text", label: "Rug color/scale" },
    { id: "textiles_curtains", input_type: "text", label: "Curtains color/opacity" },
    { id: "textiles_photos", input_type: "upload", label: "Textile photos", multiple: true },
  ],
};

const WHITE_MATCH_GROUP: FieldSpec = {
  id: "white_match_group",
  input_type: "group",
  label: "White matching",
  fields: [
    {
      id: "need_white_match",
      input_type: "yesNo",
      label: "Do we need to match existing whites (trim/doors/cabinets)?",
    },
    {
      id: "white_reference_photo",
      input_type: "upload",
      label: "Photo: white printer paper touching the white to match (daylight, lights off)",
      show_if: { need_white_match: true },
      multiple: true,
    },
    { id: "white_brand_known", input_type: "yesNo", label: "Do you know the brand/color name of that white?" },
    {
      id: "white_brand_code",
      input_type: "text",
      label: "Brand & color name/code",
      show_if: { white_brand_known: true },
    },
  ],
};

/* -------------------- Core (always asked) -------------------- */

const CORE_FIELDS: FieldSpec[] = [
  {
    id: "room_type",
    input_type: "singleSelect",
    label: "Which room?",
    options: [
      "Foyer",
      "Living",
      "Dining",
      "Kitchen",
      "Pantry",
      "Breakfast Nook",
      "Bedroom",
      "Kid's Room",
      "Nursery",
      "Home Office",
      "Bathroom",
      "Powder Room",
      "Laundry/Mudroom",
      "Hallway",
      "Stairwell",
      "Loft/Bonus",
      "Media Room",
      "Sunroom",
      "Basement",
      "Gym",
      "Closet",
      "Garage",
      "Other",
    ],
  },
  {
    id: "primary_use",
    input_type: "multiSelect",
    label: "Top uses (pick up to 3)",
    options: ["Relax", "Work/Study", "Entertain", "Sleep", "Play", "Eat", "Cook", "Get ready", "Laundry", "Storage", "Exercise", "Other"],
  },
  {
    id: "desired_vibe",
    input_type: "singleSelect",
    label: "Desired vibe",
    options: ["Calm", "Airy", "Cozy", "Focused", "Luxe", "Energizing", "Grounded", "Fresh", "Moody"],
  },
  { id: "avoid_vibe", input_type: "text", label: "Vibe you do NOT want" },
  {
    id: "lighting",
    input_type: "text",
    label: "How is the lighting? (e.g., lots of daylight, warm artificial light)",
  },
  {
    id: "room_photos",
    input_type: "upload",
    label: "Room photos (8am/noon/4pm; lights off + on)",
    helper: "Daylight near a window; include one shot with white paper for reference.",
    multiple: true,
  },
  {
    id: "existing_elements",
    input_type: "group",
    label: "Existing materials or big furniture to match?",
    fields: [
      { id: "existing_elements_desc", input_type: "text", label: "Describe key existing items (optional)" },
      { id: "existing_elements_photos", input_type: "upload", label: "Photos of existing items", multiple: true },
    ],
  },
  {
    id: "adjacent_photos",
    input_type: "upload",
    label: "Photos of adjacent rooms/sightlines",
    multiple: true,
  },
];

/* -------------------- Carryover & constraints (always asked) -------------------- */

const CARRYOVER_FIELDS: FieldSpec[] = [
  {
    id: "existing_paint_staying",
    input_type: "yesNo",
    label: "Is any current paint staying?",
  },
  {
    id: "staying_details",
    input_type: "group",
    label: "Staying paint details",
    show_if: { existing_paint_staying: true },
    fields: [
      {
        id: "staying_surfaces",
        input_type: "multiSelect",
        label: "Where is it staying?",
        options: ["Walls", "Trim/Doors", "Ceiling", "Cabinets"],
      },
      { id: "staying_brand", input_type: "text", label: "Brand & color name/code" },
      {
        id: "staying_finish",
        input_type: "singleSelect",
        label: "Finish",
        options: ["Flat", "Matte", "Eggshell", "Satin", "Semi-gloss", "Gloss"],
      },
      {
        id: "staying_photo",
        input_type: "upload",
        label: "Photo with white printer paper",
        multiple: true,
      },
    ],
  },
  {
    id: "must_include_color",
    input_type: "yesNo",
    label: "Do you want a specific color included?",
  },
  {
    id: "include_color_entry",
    input_type: "group",
    label: "Must-include color",
    show_if: { must_include_color: true },
    fields: [
      { id: "include_brand", input_type: "text", label: "Brand & color code (if known)" },
      { id: "include_photo", input_type: "upload", label: "Upload next to white paper", multiple: true },
    ],
  },
  {
    id: "temperature_preference",
    input_type: "slider",
    label: "Warm ↔ Cool preference",
    helper: "0 = cool, 5 = neutral, 10 = warm",
    min: 0,
    max: 10,
  },
  {
    id: "saturation_comfort",
    input_type: "singleSelect",
    label: "Color intensity preference",
    options: ["Neutral", "Balanced", "Bold"],
  },
  {
    id: "dark_comfort",
    input_type: "slider",
    label: "Comfort with dark colors",
    min: 0,
    max: 5,
  },
  {
    id: "sheen_preferences",
    input_type: "group",
    label: "Sheen preferences by surface",
    fields: [
      {
        id: "sheen_walls",
        input_type: "singleSelect",
        label: "Walls",
        options: ["Flat", "Matte", "Eggshell", "Satin"],
      },
      {
        id: "sheen_trim",
        input_type: "singleSelect",
        label: "Trim/Doors",
        options: ["Satin", "Semi-gloss", "Gloss"],
      },
      {
        id: "sheen_cabinets",
        input_type: "singleSelect",
        label: "Cabinets (if any)",
        options: ["Satin", "Semi-gloss", "Gloss", "N/A"],
      },
      { id: "sheen_ceiling", input_type: "singleSelect", label: "Ceiling", options: ["Flat", "Matte"] },
    ],
  },
  { id: "non_negotiables", input_type: "text", label: "Non-negotiables to honor (items, finishes, heirlooms)" },
  { id: "brand_notes", input_type: "text", label: "Any paint brands to use or avoid? (optional)" },
  WHITE_MATCH_GROUP,
];

/* -------------------- Room modules (conditional) -------------------- */

const FOYER: FieldSpec[] = [
  { id: "front_door_has_glass", input_type: "yesNo", label: "Front door has glass/sidelights?" },
  { id: "stair_present", input_type: "yesNo", label: "Staircase in view?" },
  {
    id: "stair_details",
    input_type: "group",
    label: "Stair details",
    show_if: { stair_present: true },
    fields: [
      { id: "stair_tread_riser", input_type: "text", label: "Treads/risers/banister colors" },
      { id: "stair_material_photo", input_type: "upload", label: "Stair close-ups", multiple: true },
    ],
  },
  { id: "foyer_floor_photo", input_type: "upload", label: "Entry flooring (close-up + wide)", multiple: true },
  { id: "statement_preference", input_type: "singleSelect", label: "Statement moment preference", options: ["Front door", "Ceiling", "Console wall", "Subtle"] },
];

const LIVING: FieldSpec[] = [
  { id: "fireplace_present", input_type: "yesNo", label: "Fireplace present?" },
  {
    id: "fireplace_group",
    input_type: "group",
    label: "Fireplace",
    show_if: { fireplace_present: true },
    fields: [
      { id: "fireplace_material", input_type: "singleSelect", label: "Material", options: ["Brick", "Stone", "Tile", "Painted", "Other"] },
      { id: "fireplace_photo", input_type: "upload", label: "Fireplace photos", multiple: true },
    ],
  },
  { id: "media_wall", input_type: "yesNo", label: "TV/media wall?" },
  { id: "builtins_present", input_type: "yesNo", label: "Built-ins/shelving present?" },
  { id: "sofa_rug_curtains_photos", input_type: "upload", label: "Sofa, rug & curtains (photos)", multiple: true },
  { id: "ceiling_height", input_type: "text", label: "Ceiling height / beams?" },
  { id: "accent_strategy", input_type: "singleSelect", label: "Accent strategy", options: ["None", "One feature wall", "Full subtle contrast", "Wrap the room"] },
];

const DINING: FieldSpec[] = [
  { id: "table_tone", input_type: "text", label: "Table wood tone/undertone" },
  { id: "chair_upholstery", input_type: "text", label: "Chair upholstery color" },
  { id: "chandelier_finish", input_type: "text", label: "Chandelier metal & scale" },
  { id: "has_paneling", input_type: "yesNo", label: "Wainscot/paneling/wallpaper?" },
  { id: "dining_open_to_kitchen", input_type: "yesNo", label: "Open to kitchen?" },
  { id: "ceiling_intimacy", input_type: "yesNo", label: "Interested in slightly deeper ceiling for intimacy?" },
];

const KITCHEN: FieldSpec[] = [
  CABINETRY_GROUP,
  {
    id: "island_statement",
    input_type: "yesNo",
    label: "Different color for island/lowers?",
    show_if: { dark_comfort: { ">=": 3 } },
  },
  {
    id: "countertops_group",
    input_type: "group",
    label: "Countertops",
    fields: [
      { id: "counter_material", input_type: "singleSelect", label: "Material", options: ["Quartz", "Granite", "Marble", "Butcher Block", "Laminate", "Other"] },
      {
        id: "counter_undertone",
        input_type: "singleSelect",
        label: "Dominant undertone",
        options: ["Neutral", "Warm (yellow/gold)", "Cool (blue)", "Green", "Pink/Red", "Brown"],
      },
      { id: "counter_photo", input_type: "upload", label: "Countertop photos (with white paper)", multiple: true },
    ],
  },
  {
    id: "backsplash_group",
    input_type: "group",
    label: "Backsplash",
    fields: [
      { id: "backsplash_tile", input_type: "singleSelect", label: "Tile type", options: ["Subway", "Zellige", "Slab", "Mosaic", "Other"] },
      { id: "backsplash_finish", input_type: "singleSelect", label: "Finish", options: ["Matte", "Satin", "Gloss"] },
      { id: "backsplash_grout", input_type: "text", label: "Grout color" },
      { id: "backsplash_photo", input_type: "upload", label: "Backsplash photos", multiple: true },
    ],
  },
  {
    id: "appliances",
    input_type: "singleSelect",
    label: "Appliances",
    options: ["Stainless", "Panel-ready", "White", "Black", "Mixed"],
  },
  METALS_GROUP,
  { id: "uc_lighting", input_type: "yesNo", label: "Under-cabinet lighting present?" },
  {
    id: "open_concept",
    input_type: "yesNo",
    label: "Open concept with adjacent spaces?",
  },
];

const PANTRY: FieldSpec[] = [
  { id: "open_shelving", input_type: "yesNo", label: "Open shelving?" },
  { id: "door_match_kitchen", input_type: "yesNo", label: "Match kitchen door/cabinet colors?" },
  { id: "low_light", input_type: "yesNo", label: "Lower light than kitchen?" },
];

const NOOK: FieldSpec[] = [
  { id: "banquette", input_type: "yesNo", label: "Banquette seating?" },
  { id: "banquette_upholstery", input_type: "text", label: "Banquette upholstery color" },
  { id: "glare_issue", input_type: "yesNo", label: "Morning glare on windows?" },
];

const BEDROOM: FieldSpec[] = [
  { id: "vibe_target_bed", input_type: "singleSelect", label: "Primary vibe", options: ["Restful", "Cozy", "Airy", "Luxe"] },
  { id: "sleep_routine", input_type: "singleSelect", label: "Window treatment", options: ["Blackout", "Room darkening", "Sheer", "None"] },
  TEXTILES_GROUP,
  { id: "accent_wall_headboard", input_type: "yesNo", label: "Accent wall behind headboard?" },
  {
    id: "art_above_bed",
    input_type: "yesNo",
    label: "Art above bed?",
    show_if: { accent_wall_headboard: true },
  },
];

const KIDS: FieldSpec[] = [
  { id: "kids_theme", input_type: "text", label: "Theme (if any)" },
  {
    id: "kids_horizon",
    input_type: "singleSelect",
    label: "Longevity horizon",
    options: ["1–2 years", "3–5 years", "5+ years"],
  },
  { id: "activity_zones", input_type: "multiSelect", label: "Zones", options: ["Sleep", "Play", "Study"] },
  { id: "durability_priority", input_type: "slider", label: "Durability/washability priority", min: 0, max: 5 },
];

const NURSERY: FieldSpec[] = [
  { id: "stimulation_level", input_type: "singleSelect", label: "Stimulation level", options: ["Ultra-calm", "Gentle play", "Cheerful"] },
  { id: "night_feeds", input_type: "yesNo", label: "Night feeds expected (very warm evening lighting)?" },
  { id: "due_date_timeline", input_type: "singleSelect", label: "Due date timeline", options: ["< 4 weeks", "4–8 weeks", "8+ weeks"] },
];

const OFFICE: FieldSpec[] = [
  { id: "on_camera", input_type: "yesNo", label: "Will you be on camera here?" },
  {
    id: "camera_bg",
    input_type: "upload",
    label: "Upload photo of on-camera background area",
    show_if: { on_camera: true },
    multiple: true,
  },
  { id: "glare_issue_office", input_type: "yesNo", label: "Screen glare issues?" },
  { id: "deeper_backdrop_ok", input_type: "yesNo", label: "Open to deeper backdrop for focus?" },
];

const BATHROOM: FieldSpec[] = [
  {
    id: "vanity_group",
    input_type: "group",
    label: "Vanity",
    fields: [
      { id: "vanity_color", input_type: "text", label: "Vanity color/wood" },
      { id: "vanity_top", input_type: "text", label: "Counter material/undertone" },
      { id: "vanity_photo", input_type: "upload", label: "Vanity photos", multiple: true },
    ],
  },
  TILE_GROUP,
  METALS_GROUP,
  { id: "moisture_level", input_type: "singleSelect", label: "Moisture level", options: ["Low", "Medium", "High"] },
  { id: "mirror_type", input_type: "singleSelect", label: "Mirror type", options: ["Framed", "Frameless", "Backlit"] },
];

const POWDER: FieldSpec[] = [
  { id: "bold_comfort", input_type: "slider", label: "Comfort with bold/saturated/dark", min: 0, max: 5 },
  { id: "wallpaper_planned", input_type: "yesNo", label: "Wallpaper planned?" },
  METALS_GROUP,
];

const LAUNDRY: FieldSpec[] = [
  { id: "mudroom_lockers", input_type: "yesNo", label: "Lockers/beadboard/shiplap present?" },
  { id: "appliances_color", input_type: "singleSelect", label: "Appliance color", options: ["White", "Black", "Stainless", "Panel-ready"] },
  { id: "water_exposure", input_type: "singleSelect", label: "Water exposure", options: ["Low", "Medium", "High"] },
  { id: "scuff_resistance", input_type: "slider", label: "Scuff-resistance priority", min: 0, max: 5 },
];

const HALLWAY: FieldSpec[] = [
  { id: "hall_light", input_type: "singleSelect", label: "Natural light", options: ["Low", "Medium", "High"] },
  { id: "gallery_intent", input_type: "yesNo", label: "Use as gallery wall for art?" },
  { id: "door_color_strategy", input_type: "singleSelect", label: "Door color strategy", options: ["Match trim", "Contrast", "Mixed"] },
];

const STAIRWELL: FieldSpec[] = [
  { id: "multi_story", input_type: "yesNo", label: "Multi-story stairwell?" },
  { id: "tread_riser_plan", input_type: "text", label: "Treads/risers/rails color plan" },
  { id: "safety_contrast", input_type: "yesNo", label: "Need stronger safety contrast?" },
];

const LOFT: FieldSpec[] = [
  { id: "loft_zones", input_type: "multiSelect", label: "Zones", options: ["Study", "Play", "Media", "Guest"] },
  { id: "stronger_accents_ok", input_type: "yesNo", label: "Okay to use stronger accents to define zones?" },
];

const MEDIA: FieldSpec[] = [
  { id: "display_type", input_type: "singleSelect", label: "Display", options: ["Projector", "TV"] },
  { id: "low_reflectance_env", input_type: "yesNo", label: "Prefer low-reflectance envelope (darker walls/ceiling)?" },
  { id: "bias_lighting", input_type: "yesNo", label: "Bias lighting behind display?" },
];

const SUNROOM: FieldSpec[] = [
  { id: "intense_daylight", input_type: "yesNo", label: "Very intense daylight?" },
  { id: "plant_collection", input_type: "yesNo", label: "Large plant collection to harmonize with?" },
  { id: "uv_concern", input_type: "yesNo", label: "UV fading concerns?" },
];

const BASEMENT: FieldSpec[] = [
  { id: "basement_height", input_type: "text", label: "Ceiling height / soffits" },
  { id: "basement_moisture", input_type: "singleSelect", label: "Moisture history", options: ["None", "Occasional", "Frequent"] },
  { id: "basement_zones", input_type: "multiSelect", label: "Zones", options: ["Media", "Gym", "Guest", "Play", "Storage"] },
];

const GYM: FieldSpec[] = [
  { id: "mirror_wall", input_type: "yesNo", label: "Mirror wall present?" },
  { id: "gym_mood", input_type: "singleSelect", label: "Mood", options: ["Cool/energizing", "Warm/spa calm"] },
  { id: "rubber_floor_undertone", input_type: "singleSelect", label: "Rubber floor undertone", options: ["Neutral", "Blue", "Green", "Red", "Speckled/mixed"] },
];

const CLOSET: FieldSpec[] = [
  { id: "color_accuracy_priority", input_type: "yesNo", label: "High color accuracy for clothing?" },
  { id: "closet_cabinetry", input_type: "yesNo", label: "Built-in cabinetry present?" },
  { id: "closet_lighting_cct", input_type: "singleSelect", label: "Lighting CCT", options: ["3000K", "3500K", "4000K+"] },
];

const GARAGE: FieldSpec[] = [
  { id: "garage_use", input_type: "multiSelect", label: "Use", options: ["Parking", "Workshop", "Storage", "Gym"] },
  { id: "garage_finish_priority", input_type: "slider", label: "Scrub/mark resistance priority", min: 0, max: 5 },
  { id: "garage_floor_coating", input_type: "singleSelect", label: "Floor coating", options: ["None", "Epoxy", "Polyurea", "Other"] },
];

const OTHER: FieldSpec[] = [
  { id: "other_space_desc", input_type: "text", label: "Describe the space" },
  { id: "other_goals", input_type: "text", label: "Goals for this space" },
];

/* -------------------- Assembly -------------------- */

const ROOM_MODULES: Record<RoomType, FieldSpec[]> = {
  Foyer: FOYER,
  Living: LIVING,
  Dining: DINING,
  Kitchen: KITCHEN,
  Pantry: PANTRY,
  "Breakfast Nook": NOOK,
  Bedroom: BEDROOM,
  "Kid's Room": KIDS,
  Nursery: NURSERY,
  "Home Office": OFFICE,
  Bathroom: BATHROOM,
  "Powder Room": POWDER,
  "Laundry/Mudroom": LAUNDRY,
  Hallway: HALLWAY,
  Stairwell: STAIRWELL,
  "Loft/Bonus": LOFT,
  "Media Room": MEDIA,
  Sunroom: SUNROOM,
  Basement: BASEMENT,
  Gym: GYM,
  Closet: CLOSET,
  Garage: GARAGE,
  Other: OTHER,
};

/* -------------------- Exported graph -------------------- */

export const INTAKE_GRAPH: Graph = {
  core: CORE_FIELDS,
  carryover: CARRYOVER_FIELDS,
  modules: ROOM_MODULES,
  subgroups: {
    metals: METALS_GROUP,
    tile: TILE_GROUP,
    cabinetry: CABINETRY_GROUP,
    textiles: TEXTILES_GROUP,
    white_match: WHITE_MATCH_GROUP,
  },
} as const;

/**
 * Helper: get fields for a given room.
 */
export function getRoomModule(room: RoomType): FieldSpec[] {
  return INTAKE_GRAPH.modules[room] ?? OTHER;
}
