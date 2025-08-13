export function shimmer(w = 1600, h = 900) {
  return `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs><linearGradient id="g"><stop stop-color="#eee" offset="20%" /><stop stop-color="#ddd" offset="50%" /><stop stop-color="#eee" offset="70%" /></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="#eee"/><rect id="r" width="${w}" height="${h}" fill="url(#g)"/>
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
  </svg>`;
}
export const toBase64 = (s: string) =>
  typeof window === "undefined" ? Buffer.from(s).toString("base64") : window.btoa(s);
