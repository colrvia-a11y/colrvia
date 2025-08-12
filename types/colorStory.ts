export type PaletteColor = {
  hex: string;
  name: string;
  brand: string;
  placement: string;
};
export type DesignerId = 'emily' | 'zane' | 'marisol' | 'therapist';

export type ColorStory = {
  id: string;
  title: string;
  narrative: string;
  palette: PaletteColor[];
  designer: DesignerId;
  createdAt: string;
};
export type DesignerProfile = {
  id: DesignerId;
  name: string;
  tagline: string;
  style: string;
  avatar?: string;
};
