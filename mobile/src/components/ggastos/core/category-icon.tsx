import { createElement } from 'react';

import { categoryIconComponent } from '@/constants/category-icons';
import { GgastosColors } from '@/constants/ggastos-theme';

type CategoryIconProps = { name?: string | null; size?: number; color?: string };

export function CategoryIcon({ name, size = 17, color = GgastosColors.inkStrong }: CategoryIconProps) {
  return createElement(categoryIconComponent(name), { size, color, strokeWidth: 2 });
}
