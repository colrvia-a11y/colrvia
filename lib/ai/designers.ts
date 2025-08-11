export type Designer = {
  id: string;
  name: string;
  avatar: string; // emoji or short label
  tagline: string;
  style: string; // prompt style or description
  short: string; // short CTA label
};

export const designers: Designer[] = [
  {
    id: 'minimalist',
    name: 'Minimalist Mae',
    avatar: '🧊',
    tagline: 'Clean, calm, straight to the point.',
    style: 'succinct, structured, minimalist, offers 1 concise suggestion at a time',
    short: 'Mae'
  },
  {
    id: 'playful',
    name: 'Playful Piper',
    avatar: '🎈',
    tagline: 'Upbeat, colorful metaphors, encouraging.',
    style: 'cheerful, metaphorical, encouraging but still concise',
    short: 'Piper'
  },
  {
    id: 'pro',
    name: 'Pro Reese',
    avatar: '📐',
    tagline: 'Seasoned interior pro. Practical & decisive.',
    style: 'professional, decisive, grounded in interior design practice',
    short: 'Reese'
  }
];

export const getDesigner = (id: string) => designers.find(d => d.id === id) || designers[0];
