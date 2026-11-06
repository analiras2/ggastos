import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

type WalletHeaderProps = {
  label?: string;
  value: string;
  isNegative?: boolean;
  // Tapping the value lets the user correct it.
  onPressValue?: () => void;
  onPressSearch?: () => void;
};

const SEARCH_BUTTON_SIZE = 44;

// Current wallet value pinned at the top of the screen, with the search shortcut.
export function WalletHeader({
  label = 'Carteira',
  value,
  isNegative = false,
  onPressValue,
  onPressSearch,
}: WalletHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustar saldo da carteira"
        disabled={!onPressValue}
        onPress={onPressValue}
        style={styles.texts}
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isNegative ? styles.valueNegative : null]}>{value}</Text>
      </Pressable>
      {onPressSearch ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buscar lançamentos"
          onPress={onPressSearch}
          style={styles.searchButton}
        >
          <Icon name="search" size={20} />
        </Pressable>
      ) : null}
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
  valueNegative: {
    color: GgastosColors.expense,
  },
  searchButton: {
    width: SEARCH_BUTTON_SIZE,
    height: SEARCH_BUTTON_SIZE,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
