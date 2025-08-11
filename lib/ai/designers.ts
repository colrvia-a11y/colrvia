export type Designer = {
  id: string;
  name: string;
  avatar: string; // emoji or short label
  tagline: string;
  style: string; // prompt style or description
  short: string; // short CTA label
  heroImage: string; // path to hero image asset
  pro?: boolean;    // gated behind subscription if true
};

export const designers: Designer[] = [
  {
    id: 'therapist',
    name: 'Color Therapist',
    avatar: '🛋️',
    tagline: 'Warm, validating, gently curious.',
    style: 'warm, validating, one sentence acknowledgement then one short question',
    short: 'Therapist',
    heroImage: '/designers/therapist.svg',
    pro: false
  },
  {
    id: 'minimalist',
    name: 'Mae the Minimalist',
    avatar: '🧼',
    tagline: 'Clean, airy, decisive.',
    style: 'succinct, structured, minimalist, offers 1 concise suggestion at a time',
    short: 'Mae',
    heroImage: '/designers/minimalist.svg',
    pro: true
  },
  {
    id: 'naturalist',
    name: 'Cozy Naturalist',
    avatar: '🌿',
    tagline: 'Friendly, calm, nature-inspired.',
    style: 'friendly, calm, nature-inspired, simple and soothing',
    short: 'Naturalist',
    heroImage: '/designers/naturalist.svg',
    pro: true
  }
];

export const getDesigner = (id: string) => designers.find(d => d.id === id) || designers[0];

export const DEFAULT_DESIGNER_ID = 'therapist';

export function isDesignerLocked(tier: 'free'|'pro', designerId: string){
  const d = getDesigner(designerId);
  if (!d) return false;
  if (tier === 'pro') return false;
  return !!d.pro;
}
