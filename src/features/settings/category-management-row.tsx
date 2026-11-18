import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/shared/ui/core/icon';
import { IMPACT_TYPE_LABELS, type ImpactType } from '@/shared/contracts/finance';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

const CHEVRON_SIZE = 18;
const DEFAULT_ROW_OPACITY = 0.72;

type CategoryRowProps = {
  category: { name: string; impactType: ImpactType; isPersonal: boolean };
  onPress: () => void;
};

export function CategoryManagementRow({ category, onPress }: CategoryRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={!category.isPersonal}
      onPress={onPress}
      style={[styles.row, !category.isPersonal && styles.rowDefault]}
    >
      <View>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.meta}>
          {IMPACT_TYPE_LABELS[category.impactType]} · {category.isPersonal ? 'Pessoal' : 'Padrão'}
        </Text>
      </View>
      {category.isPersonal ? <Icon name="chevron-right" size={CHEVRON_SIZE} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  rowDefault: { opacity: DEFAULT_ROW_OPACITY },
  name: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  meta: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
