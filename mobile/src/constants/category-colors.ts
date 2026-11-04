// One color per category, derived from its id so every screen (month tab,
// annual report) shows the same color for the same category.
export const CATEGORY_COLORS = [
  '#1F6B57',
  '#C65A46',
  '#356FA8',
  '#C28A2C',
  '#7A5C9E',
  '#477A89',
  '#A26D47',
  '#B5486F',
  '#5E8C2F',
  '#D2793A',
  '#3F5FA0',
  '#8A8F2B',
] as const;

const HASH_MULTIPLIER = 31;
const HEX_ALPHA_SOFT = '26';

export function categoryColor(categoryId: string): string {
  let hash = 0;
  for (let index = 0; index < categoryId.length; index += 1) {
    hash = (hash * HASH_MULTIPLIER + categoryId.charCodeAt(index)) % CATEGORY_COLORS.length;
  }
  return CATEGORY_COLORS[hash];
}

export function categoryColorSoft(color: string): string {
  return `${color}${HEX_ALPHA_SOFT}`;
}
