// lib/a11y/contrast.ts
export const hexToRgb = (hex: string) =>
  hex.replace('#', '').match(/.{1,2}/g)!.map(h => parseInt(h, 16) / 255);

const lum = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

export const relativeLuminance = ([r, g, b]: number[]) =>
  0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);

export const contrastRatio = (a: string, b: string) => {
  const L1 = relativeLuminance(hexToRgb(a) as any);
  const L2 = relativeLuminance(hexToRgb(b) as any);
  const [hi, lo] = [Math.max(L1, L2), Math.min(L1, L2)];
  return (hi + 0.05) / (lo + 0.05);
};
