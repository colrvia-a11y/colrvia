export type PaletteColor = {
  hex: string;
  name: string;
  brand: string;
  placement: string;
};
export type ColorStory = {
  id: string;
  title: string;
  narrative: string;
  palette: PaletteColor[];
  designer: 'emily' | 'zane' | 'marisol';
  createdAt: string;
};
export type DesignerProfile = {
  id: 'emily' | 'zane' | 'marisol';
  name: string;
  tagline: string;
  style: string;
  avatar?: string;
};
