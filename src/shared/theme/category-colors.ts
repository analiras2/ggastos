// One color per category, derived from its id so every screen (month tab,
// annual report) shows the same color for the same category.
// ColorBrewer "Paired" (12 classes).
export const CATEGORY_COLORS = [
  '#A6CEE3',
  '#1F78B4',
  '#B2DF8A',
  '#33A02C',
  '#FB9A99',
  '#E31A1C',
  '#FDBF6F',
  '#FF7F00',
  '#CAB2D6',
  '#6A3D9A',
  '#FFFF99',
  '#B15928',
] as const;

const HASH_MULTIPLIER = 31;
const INK_ON_LIGHT = '#1F1A17';
const INK_ON_DARK = '#FFFFFF';
const LIGHT_BACKGROUND_BRIGHTNESS = 0.6;
const BYTE_MAX = 255;

export function categoryColor(categoryId: string): string {
  let hash = 0;
  for (let index = 0; index < categoryId.length; index += 1) {
    hash = (hash * HASH_MULTIPLIER + categoryId.charCodeAt(index)) % CATEGORY_COLORS.length;
  }
  return CATEGORY_COLORS[hash];
}

// Icon color that stays readable on top of a category color (light or dark).
export function categoryIconColor(backgroundColor: string): string {
  const red = parseInt(backgroundColor.slice(1, 3), 16);
  const green = parseInt(backgroundColor.slice(3, 5), 16);
  const blue = parseInt(backgroundColor.slice(5, 7), 16);
  const brightness = (0.299 * red + 0.587 * green + 0.114 * blue) / BYTE_MAX;
  return brightness > LIGHT_BACKGROUND_BRIGHTNESS ? INK_ON_LIGHT : INK_ON_DARK;
}
