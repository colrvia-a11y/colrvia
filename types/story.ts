export type Brand = 'SW'|'Behr';
export type Lighting = 'day'|'evening'|'mixed';
export type Designer = 'Emily'|'Zane'|'Marisol';
export type Vibe =
  | 'Cozy Neutral' | 'Airy Coastal' | 'Earthy Organic'
  | 'Modern Warm'  | 'Soft Pastels' | 'Moody Blue-Green';
export type Role = 'walls'|'trim'|'ceiling'|'cabinets'|'accent';
export type Paint = { name:string; code:string; brand:Brand; hex:string; tags?:string[] };
// Full Swatch used internally ties to a role; decoding may yield partial.
export type Swatch = Paint & { role: Role };
// Lightweight palette swatch shape for decoded / resilient palette arrays.
export type DecodedSwatch = {
  name?: string;
  brand?: string; // keep flexible for upstream
  code?: string;
  hex?: string; // normalized #RRGGBB
  role?: string;
};
export type Placements = { walls:string; trim:string; ceiling?:string; cabinets?:string; accent?:string; pct?:{ sixty:number; thirty:number; ten:number } };
export type GenerateInput = {
  designer: Designer; vibe: Vibe; brand: Brand;
  roomType?: string; lighting: Lighting; hasWarmWood: boolean; photoUrl?: string|null;
};
export type ColorStory = {
  id: string; userId: string; title: string; designer: Designer; vibe: Vibe; brand: Brand;
  roomType?: string; lighting: Lighting; hasWarmWood: boolean; photoUrl?: string|null;
  palette: Swatch[]; placements: Placements; narrative: string; previewUrl?: string|null;
  createdAt: string;
};

export type VariantType = 'recommended'|'softer'|'bolder';
export interface StoryIndexItem {
  id:string; title:string; createdAt:string; brand:Brand; vibe:string; designer:string;
  swatches: Array<{ hex:string; role?:Role }>;
  hasVariants?: boolean;
}
