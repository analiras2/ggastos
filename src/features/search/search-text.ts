// Lowercases and strips accents so "cafe" finds "Café".
export function normalizeSearchText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function matchesSearch(text: string, normalizedQuery: string): boolean {
  return normalizedQuery.length > 0 && normalizeSearchText(text).includes(normalizedQuery);
}
