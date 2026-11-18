// Text and date comparisons used to score a transaction against a planned entry.

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1),
  );
}

function stripInstallmentMarkers(text: string): string {
  return text.replace(/\b\d{1,2}\/\d{1,2}\b/g, " ");
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function descriptionSimilarity(a: string, b: string): number {
  return Math.max(
    jaccardSimilarity(a, b),
    jaccardSimilarity(stripInstallmentMarkers(a), stripInstallmentMarkers(b)),
  );
}

export function daysBetween(isoA: string, isoB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime()) / msPerDay;
}
