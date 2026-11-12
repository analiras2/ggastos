import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/shared/theme/ggastos-theme';

type WalletHeaderProps = {
  // "onPrimary" is for use over the primary color.
  tone?: 'default' | 'onPrimary';
  label?: string;
  value: string;
  isNegative?: boolean;
  // Tapping the value lets the user correct it.
  onPressValue?: () => void;
};

const ON_PRIMARY = '#FFFFFF';
const ON_PRIMARY_SOFT = 'rgba(255, 255, 255, 0.72)';
const NEGATIVE_ON_PRIMARY = '#FFD2CB';

// Current wallet value pinned at the top of the screen.
export function WalletHeader({
  tone = 'default',
  label = 'Carteira',
  value,
  isNegative = false,
  onPressValue,
}: WalletHeaderProps) {
  const isOnPrimary = tone === 'onPrimary';

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustar saldo da carteira"
        disabled={!onPressValue}
        onPress={onPressValue}
        style={styles.texts}
      >
        <Text style={[styles.label, isOnPrimary && styles.labelOnPrimary]}>{label}</Text>
        <Text style={[styles.value, isOnPrimary && styles.valueOnPrimary, isNegative && (isOnPrimary ? styles.negativeOnPrimary : styles.valueNegative)]}>
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  texts: {
    gap: 2,
  },
  label: {
    ...GgastosType.labelCaps,
    color: GgastosColors.inkFaint,
  },
  value: {
    ...GgastosType.displayXl,
    color: GgastosColors.inkStrong,
  },
  labelOnPrimary: { color: ON_PRIMARY_SOFT },
  valueOnPrimary: { color: ON_PRIMARY },
  negativeOnPrimary: { color: NEGATIVE_ON_PRIMARY },
  valueNegative: {
    color: GgastosColors.expense,
  },
});
