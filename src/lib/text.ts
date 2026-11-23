export function deriveTitle(text: string, max = 40): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
