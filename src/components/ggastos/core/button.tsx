import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

type ButtonProps = {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  fullWidth,
  disabled,
  onPress,
  style,
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon}
      <Text style={[styles.label, variantTextStyles[variant]]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: GgastosRadius.pill,
    borderWidth: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  label: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
  },
});

const sizeStyles = StyleSheet.create({
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  sm: { paddingVertical: 9, paddingHorizontal: 16 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: GgastosColors.brandPrimary, borderColor: GgastosColors.brandPrimary },
  secondary: { backgroundColor: GgastosColors.bgSurface, borderColor: GgastosColors.lineSoft },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  danger: { backgroundColor: GgastosColors.expenseSoft, borderColor: 'transparent' },
});

const variantTextStyles = StyleSheet.create({
  primary: { color: '#FFFFFF' },
  secondary: { color: GgastosColors.inkStrong },
  ghost: { color: GgastosColors.brandPrimary },
  danger: { color: GgastosColors.expense },
});
