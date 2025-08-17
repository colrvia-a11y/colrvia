// lib/realtalk/questionnaire.ts
// Schema-driven, conditional flow for Single-Room Color Interview.
// Minimal runtime helpers; we keep types flexible to avoid TS fights during iteration.

export type Answers = Record<string, any>;
export type Choice = { value: string; label: string };

export type Step =
  | { id: string; kind: "single"; title: string; choices: Choice[]; required?: boolean; showIf?: (a: Answers) => boolean }
  | { id: string; kind: "multi"; title: string; choices: Choice[]; required?: boolean; showIf?: (a: Answers) => boolean; min?: number; max?: number }
  | { id: string; kind: "free"; title: string; placeholder?: string; required?: boolean; showIf?: (a: Answers) => boolean; helper?: string }
  | { id: string; kind: "tags"; title: string; required?: boolean; showIf?: (a: Answers) => boolean; helper?: string; min?: number; max?: number }
  | { id: string; kind: "boolean"; title: string; required?: boolean; showIf?: (a: Answers) => boolean; labels?: { trueLabel: string; falseLabel: string } };

export const STEPS: Step[] = [
  // Core
  { id: "roomType", kind: "single", required: true, title: "Which room are we doing?", choices: [
    { value: "kitchen", label: "Kitchen" },
    { value: "bathroom", label: "Bathroom" },
    { value: "bedroom", label: "Bedroom" },
    { value: "livingRoom", label: "Living Room" },
    { value: "diningRoom", label: "Dining Room" },
    { value: "office", label: "Office / Study" },
    { value: "kidsRoom", label: "Kid’s Room / Nursery" },
    { value: "laundryMudroom", label: "Laundry / Mudroom" },
    { value: "entryHall", label: "Entry / Hall / Stairs" },
    { value: "other", label: "Other" },
  ]},
  { id: "usage", kind: "free", required: true, title: "Who uses this room most, and what do you do here?", placeholder: "e.g., Family of four; cook daily and hang at the island." },
  { id: "moodWords", kind: "tags", required: true, title: "Three words for the mood you want", helper: "Examples: calm, cozy, happy, fresh, focused, moody, bright.", min: 1, max: 3 },

  { id: "daytimeBrightness", kind: "single", required: true, title: "How bright is it in the day?", choices: [
    { value: "veryBright", label: "Very bright" },
    { value: "kindaBright", label: "Kinda bright" },
    { value: "dim", label: "Dim" },
  ]},
  { id: "bulbColor", kind: "single", required: true, title: "At night, what kind of bulbs?", choices: [
    { value: "cozyYellow_2700K", label: "Cozy yellow (≈2700K)" },
    { value: "neutral_3000_3500K", label: "Neutral (3000–3500K)" },
    { value: "brightWhite_4000KPlus", label: "Bright white (4000K+)" },
  ]},
  { id: "boldDarkerSpot", kind: "single", required: true, title: "Do you like a bold darker spot in this room?", choices: [
    { value: "loveIt", label: "Love it" },
    { value: "maybe", label: "Maybe" },
    { value: "noThanks", label: "No thanks" },
  ]},
  { id: "colorsToAvoid", kind: "tags", title: "Any colors you do NOT want?", helper: "Up to 6." , max: 6 },
  { id: "brandPreference", kind: "single", required: true, title: "Pick one paint brand (or let me choose)", choices: [
    { value: "SherwinWilliams", label: "Sherwin-Williams" },
    { value: "BenjaminMoore", label: "Benjamin Moore" },
    { value: "Behr", label: "Behr" },
    { value: "pickForMe", label: "Pick for me" },
  ]},

  // Existing elements
  { id: "existingElements.floorLook", kind: "single", title: "Floors look mostly", choices: [
    { value: "yellowGoldWood", label: "Yellow/gold wood" },
    { value: "orangeWood", label: "Orange wood" },
    { value: "redBrownWood", label: "Red/brown wood" },
    { value: "brownNeutral", label: "Neutral brown" },
    { value: "grayBrown", label: "Gray-brown" },
    { value: "tileOrStone", label: "Tile or stone" },
    { value: "other", label: "Other" },
  ]},
  { id: "existingElements.floorLookOtherNote", kind: "free", title: "If other, tell us", showIf: a => get(a, "existingElements.floorLook") === "other" },
  { id: "existingElements.bigThingsToMatch", kind: "multi", title: "Big things to match (check all that apply)", choices: [
    { value: "countertops", label: "Countertops" },
    { value: "backsplash", label: "Backsplash" },
    { value: "tile", label: "Tile" },
    { value: "bigFurniture", label: "Big furniture" },
    { value: "rug", label: "Rug" },
    { value: "curtains", label: "Curtains" },
    { value: "builtIns", label: "Built-ins" },
    { value: "appliances", label: "Appliances" },
    { value: "fireplace", label: "Fireplace" },
    { value: "none", label: "None" },
  ]},
  { id: "existingElements.metals", kind: "single", title: "If metal shows, what is it?", choices: [
    { value: "black", label: "Black" },
    { value: "silver", label: "Silver/Chrome" },
    { value: "goldWarm", label: "Gold/Warm" },
    { value: "mixed", label: "Mixed" },
    { value: "none", label: "None" },
  ]},
  { id: "existingElements.mustStaySame", kind: "free", title: "Anything that must stay the same color?", placeholder: "e.g., trim stays white; cabinets stay navy." },

  // Color comfort
  { id: "colorComfort.overallVibe", kind: "single", title: "Overall vibe for color", choices: [
    { value: "mostlySoftNeutrals", label: "Mostly soft neutrals" },
    { value: "neutralsPlusGentleColors", label: "Neutrals + gentle colors" },
    { value: "confidentColorMoments", label: "Confident color moments" },
  ]},
  { id: "colorComfort.warmCoolFeel", kind: "single", title: "Warm vs cool feel", choices: [
    { value: "warmer", label: "Warmer" },
    { value: "cooler", label: "Cooler" },
    { value: "inBetween", label: "In between" },
  ]},
  { id: "colorComfort.contrastLevel", kind: "single", title: "Contrast level", choices: [
    { value: "verySoft", label: "Very soft" },
    { value: "medium", label: "Medium" },
    { value: "crisp", label: "Crisp" },
  ]},
  { id: "colorComfort.popColor", kind: "single", title: "Would you enjoy one small “pop” color?", choices: [
    { value: "yes", label: "Yes" },
    { value: "maybe", label: "Maybe" },
    { value: "no", label: "No" },
  ]},

  // Finishes
  { id: "finishes.wallsFinishPriority", kind: "single", title: "Walls", choices: [
    { value: "easierToWipeClean", label: "Easier to wipe clean" },
    { value: "softerFlatterLook", label: "Softer, flatter look" },
  ]},
  { id: "finishes.trimDoorsFinish", kind: "single", title: "Trim/doors", choices: [
    { value: "aLittleShiny", label: "A little shiny" },
    { value: "softerShine", label: "Softer shine" },
  ]},
  { id: "finishes.specialNeeds", kind: "multi", title: "Any special needs?", choices: [
    { value: "kids", label: "Kids" },
    { value: "pets", label: "Pets" },
    { value: "steamyShowers", label: "Steamy showers" },
    { value: "greaseHeavyCooking", label: "Grease-heavy cooking" },
    { value: "rentalRules", label: "Rental rules" },
  ]},

  // Branch: Kitchen
  { id: "roomSpecific.cabinets", kind: "single", title: "Kitchen — Cabinets", choices: [
    { value: "allNewColor", label: "All new color" },
    { value: "keepCurrentColor", label: "Keep current color" },
  ], showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.cabinetsCurrentColor", kind: "free", title: "If keeping, what color now?", showIf: a => a.roomType === "kitchen" && get(a,"roomSpecific.cabinets")==="keepCurrentColor" },
  { id: "roomSpecific.island", kind: "single", title: "Kitchen — Island", choices: [
    { value: "noIsland", label: "No island" },
    { value: "hasIsland_okDarker", label: "Has island — ok darker" },
    { value: "hasIsland_keepLight", label: "Has island — keep light" },
  ], showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.countertopsDescription", kind: "free", title: "Countertops look like", helper: "Examples: plain white, creamy, speckled, gray veins, warm stone.", showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.backsplash", kind: "single", title: "Backsplash", choices: [
    { value: "white", label: "White" },
    { value: "cream", label: "Cream" },
    { value: "color", label: "Color" },
    { value: "pattern", label: "Pattern" },
    { value: "none", label: "None" },
    { value: "describe", label: "Describe…" },
  ], showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.backsplashDescribe", kind: "free", title: "Backsplash — tell us more", showIf: a => a.roomType === "kitchen" && get(a,"roomSpecific.backsplash")==="describe" },
  { id: "roomSpecific.appliances", kind: "single", title: "Appliances", choices: [
    { value: "stainless", label: "Stainless" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "mixed", label: "Mixed" },
  ], showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.wallFeel", kind: "single", title: "Walls should feel", choices: [
    { value: "lightAiry", label: "Light + airy" },
    { value: "aBitCozier", label: "A bit cozier" },
  ], showIf: a => a.roomType === "kitchen" },
  { id: "roomSpecific.darkerSpots", kind: "multi", title: "Good spots for a darker moment", choices: [
    { value: "island", label: "Island" },
    { value: "lowerCabinets", label: "Lower cabinets" },
    { value: "doors", label: "Doors" },
    { value: "none", label: "None" },
  ], showIf: a => a.roomType === "kitchen" },

  // Branch: Bathroom
  { id: "roomSpecific.tileMainColor", kind: "single", title: "Tile main color", choices: [
    { value: "white", label: "White" },
    { value: "cream", label: "Cream" },
    { value: "gray", label: "Gray" },
    { value: "beige", label: "Beige" },
    { value: "color", label: "Color" },
  ], showIf: a => a.roomType === "bathroom" },
  { id: "roomSpecific.tileColorWhich", kind: "free", title: "If color, which?", showIf: a => a.roomType === "bathroom" && get(a,"roomSpecific.tileMainColor")==="color" },
  { id: "roomSpecific.vanityTop", kind: "single", title: "Vanity top", choices: [
    { value: "white", label: "White" }, { value: "cream", label: "Cream" }, { value: "gray", label: "Gray" }, { value: "pattern", label: "Pattern" }, { value: "wood", label: "Wood" }, { value: "other", label: "Other" },
  ], showIf: a => a.roomType === "bathroom" },
  { id: "roomSpecific.showerSteamLevel", kind: "single", title: "Shower steam level", choices: [
    { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
  ], showIf: a => a.roomType === "bathroom" },
  { id: "roomSpecific.fixtureMetal", kind: "single", title: "Fixtures (metal)", choices: [
    { value: "black", label: "Black" }, { value: "silver", label: "Silver" }, { value: "goldWarm", label: "Gold/warm" }, { value: "mixed", label: "Mixed" },
  ], showIf: a => a.roomType === "bathroom" },
  { id: "roomSpecific.goal", kind: "single", title: "Goal", choices: [
    { value: "brightClean", label: "Bright + clean" }, { value: "spaCozy", label: "Spa + cozy" },
  ], showIf: a => a.roomType === "bathroom" },
  { id: "roomSpecific.darkerVanityOrDoor", kind: "boolean", title: "Okay with a darker vanity or door?", showIf: a => a.roomType === "bathroom" },

  // Branch: Bedroom
  { id: "roomSpecific.sleepFeel", kind: "single", title: "Sleep feel", choices: [
    { value: "calmAiry", label: "Calm + airy" }, { value: "cozyCocoon", label: "Cozy cocoon" },
  ], showIf: a => a.roomType === "bedroom" },
  { id: "roomSpecific.beddingColors", kind: "tags", title: "Main bedding colors", showIf: a => a.roomType === "bedroom" },
  { id: "roomSpecific.headboard", kind: "free", title: "Headboard color/material", showIf: a => a.roomType === "bedroom" },
  { id: "roomSpecific.windowTreatments", kind: "free", title: "Curtains or shades color", showIf: a => a.roomType === "bedroom" },
  { id: "roomSpecific.darkerWallBehindBed", kind: "single", title: "Darker wall behind the bed?", choices: [
    { value: "yes", label: "Yes" }, { value: "maybe", label: "Maybe" }, { value: "no", label: "No" },
  ], showIf: a => a.roomType === "bedroom" },

  // Branch: Living Room
  { id: "roomSpecific.sofaColor", kind: "free", title: "Sofa color", showIf: a => a.roomType === "livingRoom" },
  { id: "roomSpecific.rugMainColors", kind: "tags", title: "Rug colors (main two)", showIf: a => a.roomType === "livingRoom" },
  { id: "roomSpecific.fireplace", kind: "single", title: "Fireplace", choices: [
    { value: "none", label: "None" }, { value: "brick", label: "Brick" }, { value: "stone", label: "Stone" }, { value: "painted", label: "Painted" }, { value: "tile", label: "Tile" }, { value: "other", label: "Other" },
  ], showIf: a => a.roomType === "livingRoom" },
  { id: "roomSpecific.fireplaceDetail", kind: "free", title: "If painted/tile/other—what color?", showIf: a => a.roomType === "livingRoom" && ["painted","tile","other"].includes(get(a,"roomSpecific.fireplace")) },
  { id: "roomSpecific.tvWall", kind: "single", title: "TV wall", choices: [
    { value: "keepLight", label: "Keep light" }, { value: "okDarker", label: "OK darker" },
  ], showIf: a => a.roomType === "livingRoom" },
  { id: "roomSpecific.builtInsOrDoorColor", kind: "boolean", title: "Open to a color on built-ins or a door?", showIf: a => a.roomType === "livingRoom" },

  // Branch: Dining Room
  { id: "roomSpecific.tableWoodTone", kind: "single", title: "Table wood tone", choices: [
    { value: "light", label: "Light" }, { value: "medium", label: "Medium" }, { value: "dark", label: "Dark" }, { value: "painted", label: "Painted" },
  ], showIf: a => a.roomType === "diningRoom" },
  { id: "roomSpecific.chairs", kind: "free", title: "Chairs color/material", showIf: a => a.roomType === "diningRoom" },
  { id: "roomSpecific.lightFixtureMetal", kind: "single", title: "Light fixture metal", choices: [
    { value: "black", label: "Black" }, { value: "silver", label: "Silver" }, { value: "goldWarm", label: "Gold/warm" }, { value: "mixed", label: "Mixed" },
  ], showIf: a => a.roomType === "diningRoom" },
  { id: "roomSpecific.feeling", kind: "single", title: "Feeling", choices: [
    { value: "brightDaytime", label: "Bright daytime" }, { value: "moodyEvenings", label: "Moody evenings" },
  ], showIf: a => a.roomType === "diningRoom" },
  { id: "roomSpecific.darkerBelowOrOneWall", kind: "boolean", title: "Darker below chair rail or on one wall?", showIf: a => a.roomType === "diningRoom" },

  // Branch: Office
  { id: "roomSpecific.workMood", kind: "single", title: "Work mood", choices: [
    { value: "focusedCalm", label: "Focused + calm" }, { value: "energizedBright", label: "Energized + bright" },
  ], showIf: a => a.roomType === "office" },
  { id: "roomSpecific.screenGlare", kind: "single", title: "Screen glare now", choices: [
    { value: "bad", label: "Bad" }, { value: "some", label: "Some" }, { value: "fine", label: "Fine" },
  ], showIf: a => a.roomType === "office" },
  { id: "roomSpecific.deeperLibraryWallsOk", kind: "boolean", title: "Okay with deeper walls for a “library” feel?", showIf: a => a.roomType === "office" },
  { id: "roomSpecific.colorBookshelvesOrBuiltIns", kind: "boolean", title: "Bookshelves/built-ins to color?", showIf: a => a.roomType === "office" },

  // Branch: Kids Room
  { id: "roomSpecific.mood", kind: "single", title: "Mood", choices: [
    { value: "softSoothing", label: "Soft + soothing" }, { value: "playfulHappy", label: "Playful + happy" },
  ], showIf: a => a.roomType === "kidsRoom" },
  { id: "roomSpecific.mainFabricToyColors", kind: "tags", title: "Main fabric/toy colors to match", showIf: a => a.roomType === "kidsRoom" },
  { id: "roomSpecific.superWipeableWalls", kind: "boolean", title: "Need super wipeable walls?", showIf: a => a.roomType === "kidsRoom" },
  { id: "roomSpecific.smallColorPopOk", kind: "boolean", title: "Small color pop okay?", showIf: a => a.roomType === "kidsRoom" },

  // Branch: Laundry/Mudroom
  { id: "roomSpecific.traffic", kind: "single", title: "Traffic", choices: [
    { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" },
  ], showIf: a => a.roomType === "laundryMudroom" },
  { id: "roomSpecific.cabinetsShelving", kind: "single", title: "Cabinets/shelving present?", choices: [
    { value: "yes", label: "Yes" }, { value: "no", label: "No" },
  ], showIf: a => a.roomType === "laundryMudroom" },
  { id: "roomSpecific.cabinetsColor", kind: "free", title: "If yes, what color?", showIf: a => a.roomType === "laundryMudroom" && get(a,"roomSpecific.cabinetsShelving")==="yes" },
  { id: "roomSpecific.hideDirtOrBrightClean", kind: "single", title: "Hide dirt better or feel bright + clean?", choices: [
    { value: "hideDirtBetter", label: "Hide dirt better" }, { value: "brightClean", label: "Bright + clean" },
  ], showIf: a => a.roomType === "laundryMudroom" },
  { id: "roomSpecific.doorColorMomentOk", kind: "boolean", title: "Door color moment okay?", showIf: a => a.roomType === "laundryMudroom" },

  // Branch: Entry / Hall
  { id: "roomSpecific.naturalLight", kind: "single", title: "Natural light", choices: [
    { value: "lots", label: "Lots" }, { value: "some", label: "Some" }, { value: "little", label: "Little" },
  ], showIf: a => a.roomType === "entryHall" },
  { id: "roomSpecific.stairsBanister", kind: "single", title: "Stairs/banister", choices: [
    { value: "none", label: "None" }, { value: "wood", label: "Wood" }, { value: "painted", label: "Painted" },
  ], showIf: a => a.roomType === "entryHall" },
  { id: "roomSpecific.woodTone", kind: "free", title: "If wood, what tone?", showIf: a => a.roomType === "entryHall" && get(a,"roomSpecific.stairsBanister")==="wood" },
  { id: "roomSpecific.paintColor", kind: "free", title: "If painted, what color?", showIf: a => a.roomType === "entryHall" && get(a,"roomSpecific.stairsBanister")==="painted" },
  { id: "roomSpecific.feel", kind: "single", title: "Want this area to feel", choices: [
    { value: "airyWelcome", label: "Airy welcome" }, { value: "dramaticHello", label: "Dramatic hello" },
  ], showIf: a => a.roomType === "entryHall" },
  { id: "roomSpecific.doorColorMoment", kind: "boolean", title: "Front/inside door as a color moment?", showIf: a => a.roomType === "entryHall" },

  // Branch: Other
  { id: "roomSpecific.describeRoom", kind: "free", required: true, title: "Tell us about this room", showIf: a => a.roomType === "other" },

  // Guardrails
  { id: "guardrails.mustHaves", kind: "tags", title: "Must-haves (please include…)" },
  { id: "guardrails.hardNos", kind: "tags", title: "Hard NOs (please avoid…)" },

  // Photos (links)
  { id: "photos", kind: "tags", title: "Optional photo links (2–3 daytime, 1 nighttime)", helper: "Paste URLs (https://…)" },
];

export const firstStepId = STEPS[0].id;

export function getStepById(id: string) {
  return STEPS.find(s => s.id === id);
}

export function nextStepId(currentId: string | null, a: Answers): string | "END" {
  // Find the first step after current that is shown by showIf (or no showIf)
  const i = currentId ? STEPS.findIndex(s => s.id === currentId) : -1;
  for (let k = i + 1; k < STEPS.length; k++) {
    const s = STEPS[k];
    if (!s.showIf || s.showIf(a)) return s.id;
  }
  return "END";
}

// ---- tiny path helpers ----
export function get(a: Answers, path: string) {
  return path.split(".").reduce<any>((acc, key) => (acc ? (acc as any)[key] : undefined), a as any);
}
export function set(a: Answers, path: string, value: any) {
  const keys = path.split(".");
  let node: any = a;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    node[k] ??= {};
    node = node[k];
  }
  node[keys[keys.length - 1]] = value;
}
