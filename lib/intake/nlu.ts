const NOT_SURE = [
  'not sure',
  "don't know",
  'dont know',
  'unsure',
  'no idea',
];

function isNotSure(text: string): boolean {
  const t = text.toLowerCase();
  return NOT_SURE.some(p => t.includes(p));
}

function mapFromSynonyms(map: Record<string, string[]>, text: string): string | undefined {
  let match: { key: string; len: number } | null = null;
  for (const [key, synonyms] of Object.entries(map)) {
    for (const s of synonyms) {
      if (text.includes(s) && (!match || s.length > match.len)) {
        match = { key, len: s.length };
      }
    }
  }
  return match?.key;
}

const STYLE_SYNONYMS: Record<string, string[]> = {
  modern: ['modern', 'minimal', 'minimalist', 'contemporary'],
  cottage: ['cottage', 'farmhouse', 'rustic'],
  traditional: ['traditional', 'classic'],
  japandi: ['japandi'],
  scandinavian: ['scandinavian', 'nordic'],
  industrial: ['industrial'],
  bohemian: ['bohemian', 'boho'],
  coastal: ['coastal', 'beach', 'beachy'],
  midcentury: ['mid century', 'mid-century', 'midcentury'],
  transitional: ['transitional'],
  mix: ['mix', 'eclectic'],
};

const LIGHT_SYNONYMS: Record<string, string[]> = {
  bright: ['bright', 'lots of light', 'sunny', 'well lit', 'tons of light'],
  low: ['low', 'dim', 'dark', 'not much light'],
  varies: ['varies', 'mixed', 'depends', 'changes', 'average'],
};

const STANCE_SYNONYMS: Record<string, string[]> = {
  avoid: ['avoid', 'no dark', 'keep it light', 'none', 'no dark colors'],
  walls: ['walls', 'wall', 'feature wall'],
  accents: ['accents', 'accent', 'trim only', 'just trim'],
  open: ['open', 'anywhere', 'wherever', 'designer choice', 'do whatever'],
};

const LOCATION_SYNONYMS: Record<string, string[]> = {
  walls: ['wall', 'walls', 'feature wall', 'accent wall'],
  trim: ['trim', 'baseboard', 'molding'],
  ceiling: ['ceiling', 'ceilings'],
  cabinetry: ['cabinet', 'cabinets', 'cabinetry', 'built-in', 'builtin', 'builtins'],
  doors: ['door', 'doors'],
  island: ['island'],
};

export function nluParse(id: string, transcript: string): any {
  const text = transcript.trim().toLowerCase();

  if (isNotSure(text)) {
    if (id === 'window_aspect') return 'unknown';
    if (id === 'dark_stance') return 'open';
    if (id.includes('detail')) return 'unsure';
  }

  switch (id) {
    case 'style_primary': {
      return mapFromSynonyms(STYLE_SYNONYMS, text) || (isNotSure(text) ? 'mix' : text);
    }
    case 'light_level': {
      return mapFromSynonyms(LIGHT_SYNONYMS, text) || text;
    }
    case 'dark_stance': {
      return mapFromSynonyms(STANCE_SYNONYMS, text) || text;
    }
    case 'dark_locations': {
      const locs: string[] = [];
      for (const [key, synonyms] of Object.entries(LOCATION_SYNONYMS)) {
        if (synonyms.some(s => text.includes(s))) locs.push(key);
      }
      if (locs.length) return Array.from(new Set(locs));
      if (isNotSure(text)) return ['designer_suggest'];
      return text.split(/[^a-z]+/).filter(Boolean);
    }
    case 'mood_words': {
      return text.split(/[^a-z]+/).filter(Boolean).slice(0, 3);
    }
    case 'window_aspect': {
      const MAP: Record<string, string[]> = {
        north: ['north', 'north-facing', 'north facing'],
        south: ['south', 'south-facing', 'south facing'],
        east: ['east', 'east-facing', 'east facing'],
        west: ['west', 'west-facing', 'west facing'],
      };
      return mapFromSynonyms(MAP, text) || 'unknown';
    }
    default:
      return text;
  }
}

