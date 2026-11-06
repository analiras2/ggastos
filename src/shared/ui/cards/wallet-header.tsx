import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

type WalletHeaderProps = {
  label?: string;
  value: string;
  isNegative?: boolean;
  onPressSearch?: () => void;
};

const SEARCH_BUTTON_SIZE = 44;

// Current wallet value pinned at the top of the screen, with the search shortcut.
export function WalletHeader({ label = 'Carteira', value, isNegative = false, onPressSearch }: WalletHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, isNegative ? styles.valueNegative : null]}>{value}</Text>
      </View>
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
