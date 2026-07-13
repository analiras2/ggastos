import { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { GgastosColors, GgastosRadius } from '@/constants/ggastos-theme';

type IconButtonProps = {
  icon: ReactNode;
  onPress?: () => void;
  label: string;
  size?: number;
  variant?: 'ghost' | 'solid';
  style?: ViewStyle;
};

export function IconButton({ icon, onPress, label, size = 40, variant = 'ghost', style }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size },
        variant === 'solid' ? styles.solid : styles.ghostVariant,
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: GgastosRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  solid: {
    backgroundColor: GgastosColors.bgSurface,
    borderColor: GgastosColors.lineSoft,
  },
  ghostVariant: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
});
