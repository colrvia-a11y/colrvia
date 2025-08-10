import sw from '@/data/brands/sw.json';
import behr from '@/data/brands/behr.json';
import type { Brand, Paint } from '@/types/story';
const catalogs: Record<Brand, Paint[]> = { SW: sw as any, Behr: behr as any };
export const getCatalog = (brand: Brand): Paint[] => catalogs[brand];
export const findByTag = (brand: Brand, tag: string) =>
  getCatalog(brand).filter(p => p.tags?.includes(tag));
export const byName = (brand: Brand, name: string) =>
  getCatalog(brand).find(p => p.name === name);
