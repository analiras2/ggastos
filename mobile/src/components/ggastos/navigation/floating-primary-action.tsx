import { Pressable, StyleSheet, Text } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';

type FloatingPrimaryActionProps = {
  label?: string;
  onPress?: () => void;
};

export function FloatingPrimaryAction({ label = 'Adicionar planejamento', onPress }: FloatingPrimaryActionProps) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.button, GgastosShadow.raised]}>
      <Icon name="plus" size={18} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.brandPrimary,
  },
  label: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
