import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const MAX_CARD_WIDTH = 340;
const OPTION_HEIGHT = 48;

export type SelectOption<TValue extends string> = { value: TValue; label: string };

type SelectFieldProps<TValue extends string> = {
  options: SelectOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  // Names the field for screen readers, e.g. "Tipo".
  accessibilityLabel: string;
};

// A form field that shows the chosen option and opens a list of options to pick another.
export function SelectField<TValue extends string>({ options, value, onChange, accessibilityLabel }: SelectFieldProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((option) => option.value === value)?.label ?? '';

  const handleSelect = (next: TValue) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}: ${selectedLabel}`}
        onPress={() => setIsOpen(true)}
        style={styles.field}
      >
        <Text style={styles.value}>{selectedLabel}</Text>
        <Icon name="chevron-down" size={18} />
      </Pressable>
      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <Pressable accessibilityLabel="Fechar lista" style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View style={styles.card}>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelect(option.value)}
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurface,
  },
  value: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  backdrop: { flex: 1, backgroundColor: GgastosColors.backdrop, alignItems: 'center', justifyContent: 'center', padding: GgastosSpacing.space5 },
  card: {
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
    padding: GgastosSpacing.space2,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    ...GgastosShadow.card,
  },
  option: { height: OPTION_HEIGHT, justifyContent: 'center', paddingHorizontal: GgastosSpacing.space4, borderRadius: GgastosRadius.md },
  optionSelected: { backgroundColor: GgastosColors.brandPrimarySoft },
  optionLabel: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  optionLabelSelected: { color: GgastosColors.brandPrimary, fontWeight: '700' },
});
