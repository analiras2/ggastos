import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/shared/ui/core/button';
import { CATEGORY_COLORS } from '@/shared/theme/category-colors';
import { GgastosColors, GgastosRadius, GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { CategoryAppearancePicker } from '@/features/categories/category-appearance-picker';

const DEFAULT_ICON = 'tag';
const DEFAULT_COLOR = CATEGORY_COLORS[0];

type NewCategoryPanelProps = {
  name: string;
  isPending: boolean;
  onConfirm: (icon: string, color: string) => void;
  onCancel: () => void;
};

export function NewCategoryPanel({ name, isPending, onConfirm, onCancel }: NewCategoryPanelProps) {
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState<string>(DEFAULT_COLOR);

  return (
    <View style={styles.panel}>
      <CategoryAppearancePicker name={name} icon={icon} color={color} onChangeIcon={setIcon} onChangeColor={setColor} />
      <Button fullWidth disabled={isPending} onPress={() => onConfirm(icon, color)}>
        {isPending ? 'Criando...' : 'Criar categoria'}
      </Button>
      <Button fullWidth variant="ghost" disabled={isPending} onPress={onCancel}>Cancelar</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: GgastosSpacing.space4,
    padding: GgastosSpacing.space4,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgSurfaceRaised,
  },
});
