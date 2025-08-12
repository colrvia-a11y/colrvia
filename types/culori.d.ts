declare module 'culori' {
  interface Lab65Color {
    mode: 'lab65';
    l: number;
    a: number;
    b: number;
  }

  export function differenceCiede2000(): (
    c1: Lab65Color,
    c2: Lab65Color
  ) => number;
}
