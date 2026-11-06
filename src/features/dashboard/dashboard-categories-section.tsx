import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';
import { CategoryBudgetRow } from '@/shared/ui/rows/category-budget-row';
import type { CategoryBudget } from '@/features/dashboard/dashboard-data';

type DashboardCategoriesSectionProps = {
  categories: CategoryBudget[];
  onOpenCategory: (category: CategoryBudget) => void;
};

export function DashboardCategoriesSection({ categories, onOpenCategory }: DashboardCategoriesSectionProps) {
  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.title}>Categorias</Text>
        <Text style={styles.caption}>previsto · realizado</Text>
      </View>
      {categories.map((category) => (
        <CategoryBudgetRow
          key={`${category.categoryId}:${category.impactType}`}
          name={category.name}
          icon={category.icon}
          color={category.color}
          planned={category.planned}
          delta={category.delta}
          deltaTone={category.deltaTone}
          progress={category.progress}
          onPress={() => onOpenCategory(category)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  caption: {
    ...GgastosType.label,
    color: GgastosColors.inkFaint,
  },
});
