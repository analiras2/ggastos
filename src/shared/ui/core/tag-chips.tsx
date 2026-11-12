import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';

type TagChipsProps = {
  tags: string[];
  // With a handler the chips become buttons (used as filters).
  onPressTag?: (tag: string) => void;
  selectedTag?: string | null;
};

// Small "#tag" pills; renders nothing for an empty list.
export function TagChips({ tags, onPressTag, selectedTag = null }: TagChipsProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {tags.map((tag) => {
        const isSelected = tag === selectedTag;
        return (
          <Pressable
            key={tag}
            accessibilityRole={onPressTag ? 'button' : undefined}
            accessibilityState={onPressTag ? { selected: isSelected } : undefined}
            disabled={!onPressTag}
            hitSlop={onPressTag ? 6 : undefined}
            onPress={() => onPressTag?.(tag)}
            style={[styles.chip, isSelected && styles.chipSelected]}
          >
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{tag}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: GgastosRadius.pill, backgroundColor: GgastosColors.brandPrimarySoft },
  chipSelected: { backgroundColor: GgastosColors.brandPrimary },
  label: { ...GgastosType.micro, color: GgastosColors.brandPrimary, fontWeight: '600' },
  labelSelected: { color: '#FFFFFF' },
});
