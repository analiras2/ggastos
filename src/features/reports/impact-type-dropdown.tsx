import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import type { StatisticsImpactType } from '@/features/reports/use-statistics-view-model';

const OPTIONS: { key: StatisticsImpactType; label: string }[] = [
  { key: 'EXPENSE', label: 'Despesas' },
  { key: 'INCOME', label: 'Receitas' },
  { key: 'INVESTMENT', label: 'Investimentos' },
];

const BACKDROP_COLOR = 'rgba(31, 26, 23, 0.4)';
const MAX_CARD_WIDTH = 320;
const TOUCH_HEIGHT = 44;

type ImpactTypeDropdownProps = { value: StatisticsImpactType; onChange: (value: StatisticsImpactType) => void };

// Pill that shows the chosen entry type and opens the list of types.
export function ImpactTypeDropdown({ value, onChange }: ImpactTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = OPTIONS.find((option) => option.key === value)?.label ?? '';

  const handleSelect = (key: StatisticsImpactType) => {
    onChange(key);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tipo: ${selectedLabel}`}
        onPress={() => setIsOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerLabel}>{selectedLabel}</Text>
        <Icon name="chevron-down" size={16} />
      </Pressable>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable accessibilityLabel="Fechar lista" style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={styles.card}>
            {OPTIONS.map((option) => {
              const isSelected = option.key === value;
              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelect(option.key)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space2,
    height: TOUCH_HEIGHT,
    paddingHorizontal: GgastosSpacing.space4,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
  },
  triggerLabel: { ...GgastosType.bodyMd, fontWeight: '600', color: GgastosColors.inkStrong },
  backdrop: { flex: 1, backgroundColor: BACKDROP_COLOR, alignItems: 'center', justifyContent: 'center', padding: GgastosSpacing.space5 },
  card: {
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
    padding: GgastosSpacing.space2,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    ...GgastosShadow.card,
  },
  option: { height: TOUCH_HEIGHT, justifyContent: 'center', paddingHorizontal: GgastosSpacing.space4, borderRadius: GgastosRadius.md },
  optionSelected: { backgroundColor: GgastosColors.brandPrimarySoft },
  optionLabel: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  optionLabelSelected: { color: GgastosColors.brandPrimary, fontWeight: '700' },
});
