export type Brand = 'Sherwin-Williams' | 'Behr'

export type Color = {
  brand: Brand
  code: string
  name: string
  hex: string
}

export type PaletteRole = 'primary' | 'secondary' | 'accent' | 'trim' | 'ceiling'

export type Swatch = Color & { role: PaletteRole }

export type Palette = {
  swatches: Swatch[]
  placements: Record<PaletteRole, number>
  notes?: string[]
}

export type DesignInput = {
  space?: string
  lighting?: 'Low' | 'Mixed' | 'Bright' | string
  vibe?: string[] | string
  contrast?: 'Softer' | 'Balanced' | 'Bolder' | string
  fixed?: string
  avoid?: string
  trim?: 'Clean white' | 'Creamy white' | 'Same as walls' | 'Darker trim' | string
  brand?: Brand | string
  seed?: string
}
