export function uid(prefix = "tmp"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
