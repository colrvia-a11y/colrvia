export type Designer = {
  id: string;
  name: string;
  avatar: string; // emoji or short label
  tagline: string;
  style: string; // prompt style or description
  short: string; // short CTA label
  heroImage: string; // path to hero image asset
};

export const designers: Designer[] = [
  {
    id: 'therapist',
    name: 'Color Therapist',
    avatar: '🛋️',
    tagline: 'Warm, validating, gently curious.',
    style: 'warm, validating, one sentence acknowledgement then one short question',
    short: 'Therapist',
    heroImage: '/designers/therapist.svg'
  },
  {
    id: 'minimalist',
    name: 'Bold Minimalist',
    avatar: '🧊',
    tagline: 'Clean, calm, straight to the point.',
    style: 'succinct, structured, minimalist, offers 1 concise suggestion at a time',
    short: 'Mae',
    heroImage: '/designers/minimalist.svg'
  },
  {
    id: 'naturalist',
    name: 'Cozy Naturalist',
    avatar: '🌿',
    tagline: 'Friendly, calm, nature-inspired.',
    style: 'friendly, calm, nature-inspired, simple and soothing',
    short: 'Naturalist',
    heroImage: '/designers/naturalist.svg'
  }
];

export const getDesigner = (id: string) => designers.find(d => d.id === id) || designers[0];
