import type { ColorStory } from '@/types/colorStory';

export const SAMPLE_STORIES: Record<'emily'|'zane'|'marisol', ColorStory[]> = {
  emily: [{
    id: 'sample_emily_1',
    title: 'Serene Coastal Haven',
    narrative: 'Your space speaks of tranquil mornings... a home that feels refreshing and comforting.',
    palette: [
      { hex: '#9CAF88', name: 'Weathered Sage', brand: 'Benjamin Moore', placement: 'Main living walls' },
      { hex: '#F5F5DC', name: 'Linen White', brand: 'Sherwin Williams', placement: 'Trim & ceiling' },
      { hex: '#8DB4CB', name: 'Dusty Blue', brand: 'Benjamin Moore', placement: 'Accent wall' },
      { hex: '#BFA89E', name: 'Warm Clay', brand: 'Farrow & Ball', placement: 'Textiles & art' },
      { hex: '#2F4858', name: 'Deep Slate', brand: 'Sherwin Williams', placement: 'Furniture & metal' },
    ],
    designer: 'emily',
    createdAt: new Date().toISOString()
  }],
  zane: [{
    id: 'sample_zane_1',
    title: 'Gallery Loft Pop',
    narrative: 'A confident, urban energy... pieces that spark conversation.',
    palette: [
      { hex: '#232323', name: 'Ink Black', brand: 'Benjamin Moore', placement: 'Feature wall' },
      { hex: '#FF6B6B', name: 'Neon Coral', brand: 'Sherwin Williams', placement: 'Art & accents' },
      { hex: '#FFD93D', name: 'Electric Saffron', brand: 'Farrow & Ball', placement: 'Cabinet fronts' },
      { hex: '#59C3C3', name: 'Pool Glass', brand: 'Benjamin Moore', placement: 'Secondary accent' },
      { hex: '#EAEAEA', name: 'Gallery Gray', brand: 'Sherwin Williams', placement: 'Ceiling & trim' },
    ],
    designer: 'zane',
    createdAt: new Date().toISOString()
  }],
  marisol: [{
    id: 'sample_marisol_1',
    title: 'Warm Desert Boho',
    narrative: 'Sun-warmed neutrals and handmade textures... grounded and welcoming.',
    palette: [
      { hex: '#C08A5B', name: 'Terracotta', brand: 'Farrow & Ball', placement: 'Accent wall' },
      { hex: '#EFE7DD', name: 'Almond Milk', brand: 'Benjamin Moore', placement: 'Main walls' },
      { hex: '#6B4F3B', name: 'Cocoa Bark', brand: 'Sherwin Williams', placement: 'Wood & trim' },
      { hex: '#D9C9A6', name: 'Pale Sand', brand: 'Benjamin Moore', placement: 'Textiles' },
      { hex: '#7A9E7E', name: 'Olive Leaf', brand: 'Farrow & Ball', placement: 'Plants & accents' },
    ],
    designer: 'marisol',
    createdAt: new Date().toISOString()
  }],
};
