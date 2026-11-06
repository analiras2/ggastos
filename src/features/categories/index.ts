// Public API of the categories feature. Other features import from here only.
export { resolveCategoryColor, resolveCategoryIcon } from './category-appearance';
export type { CategoryAppearanceMap } from './category-appearance';
export { CategoryAppearancePicker } from './category-appearance-picker';
export { CategoryField } from './category-field';
export { categoriesKey, categoryNamesKey, useCategories, useCategoryNames } from './use-categories';
export type { CategoryName, CategoryOption } from './use-categories';
export { useCategoryAppearance } from './use-category-appearance';
