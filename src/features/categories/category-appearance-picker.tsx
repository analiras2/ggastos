import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CategoryIcon } from '@/shared/ui/core/category-icon';
import { CATEGORY_COLORS, categoryIconColor } from '@/shared/theme/category-colors';
import { CATEGORY_ICON_OPTIONS } from '@/shared/theme/category-icons';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { CustomColorModal } from '@/features/categories/custom-color-modal';
import { CustomColorSwatch } from '@/features/categories/custom-color-swatch';

const ICON_CELL_SIZE = 44;
const COLOR_SWATCH_SIZE = 32;
const PREVIEW_SIZE = 52;
const ICON_SIZE = 20;
const SELECTED_BORDER_WIDTH = 2;

type CategoryAppearancePickerProps = {
  name: string;
  icon: string;
  color: string;
  onChangeIcon: (icon: string) => void;
  onChangeColor: (color: string) => void;
};

export function CategoryAppearancePicker({ name, icon, color, onChangeIcon, onChangeColor }: CategoryAppearancePickerProps) {
  const [isCustomColorVisible, setIsCustomColorVisible] = useState(false);
  const isCustomColor = !(CATEGORY_COLORS as readonly string[]).includes(color);

  return (
    <View style={styles.container}>
      <View style={styles.previewRow}>
        <View style={[styles.preview, { backgroundColor: color }]}>
          <CategoryIcon name={icon} size={ICON_SIZE + 4} color={categoryIconColor(color)} />
        </View>
        <Text style={styles.previewName} numberOfLines={1}>{name}</Text>
      </View>

      <Text style={styles.label}>Ícone</Text>
      <View style={styles.grid}>
        {CATEGORY_ICON_OPTIONS.map((option) => {
          const isSelected = option.name === icon;
          return (
            <Pressable
              key={option.name}
              accessibilityRole="button"
              accessibilityLabel={`Ícone ${option.name}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChangeIcon(option.name)}
              style={[styles.iconCell, isSelected && { borderColor: color, backgroundColor: color }]}
            >
              <CategoryIcon name={option.name} size={ICON_SIZE} color={isSelected ? categoryIconColor(color) : GgastosColors.inkSoft} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Cor</Text>
      <View style={styles.grid}>
        {CATEGORY_COLORS.map((swatch) => {
          const isSelected = swatch === color;
          return (
            <Pressable
              key={swatch}
              accessibilityRole="button"
              accessibilityLabel={`Cor ${swatch}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChangeColor(swatch)}
              style={[styles.swatchRing, isSelected && { borderColor: swatch }]}
            >
              <View style={[styles.swatch, { backgroundColor: swatch }]} />
            </Pressable>
          );
        })}
        <CustomColorSwatch customColor={isCustomColor ? color : null} onPress={() => setIsCustomColorVisible(true)} />
      </View>

      <CustomColorModal
        visible={isCustomColorVisible}
        initialColor={color}
        onConfirm={(customColor) => {
          onChangeColor(customColor);
          setIsCustomColorVisible(false);
        }}
        onClose={() => setIsCustomColorVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: GgastosSpacing.space3 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: GgastosSpacing.space3 },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong, flex: 1 },
  label: { ...GgastosType.labelCaps, color: GgastosColors.inkSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GgastosSpacing.space2 },
  iconCell: {
    width: ICON_CELL_SIZE,
    height: ICON_CELL_SIZE,
    borderRadius: GgastosRadius.sm,
    borderWidth: SELECTED_BORDER_WIDTH,
    borderColor: 'transparent',
    backgroundColor: GgastosColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchRing: {
    padding: 2,
    borderRadius: GgastosRadius.pill,
    borderWidth: SELECTED_BORDER_WIDTH,
    borderColor: 'transparent',
  },
  swatch: { width: COLOR_SWATCH_SIZE, height: COLOR_SWATCH_SIZE, borderRadius: COLOR_SWATCH_SIZE / 2 },
});
