import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  helperText?: string;
};

export function Select({ label, value, onChange, options, helperText }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.trigger}>
        <Text style={styles.value}>{selected?.label ?? ''}</Text>
        <Icon name="chevron-down" size={16} />
      </Pressable>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={styles.option}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GgastosColors.bgSurface,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  value: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  helper: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(31,26,23,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: GgastosColors.bgSurfaceRaised,
    borderTopLeftRadius: GgastosRadius.lg,
    borderTopRightRadius: GgastosRadius.lg,
    maxHeight: '60%',
    paddingVertical: 8,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  optionLabel: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
});
