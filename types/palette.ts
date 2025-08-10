export type BrandName = 'sherwin_williams' | 'behr'

export type PaletteRole = 'walls' | 'trim' | 'cabinets' | 'accent' | 'extra'

export interface Swatch {
  name: string
  code: string
  hex?: string | null
  role: PaletteRole
  brand: BrandName
}
export type PaletteArray = Swatch[]
