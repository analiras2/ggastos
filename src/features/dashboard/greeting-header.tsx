import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const ON_PRIMARY = '#FFFFFF';
const ON_PRIMARY_SOFT = 'rgba(255, 255, 255, 0.78)';
const SEARCH_BUTTON_SIZE = 44;

type GreetingHeaderProps = { title: string; quote: string; onPressSearch: () => void };

// "Olá, name" with a short money tip under it and the search button at the top right.
export function GreetingHeader({ title, quote, onPressSearch }: GreetingHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.quote}>{quote}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Buscar lançamentos" onPress={onPressSearch} style={styles.searchButton}>
        <Icon name="search" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  texts: { flex: 1, gap: 2, paddingTop: 2 },
  title: { ...GgastosType.displaySm, color: ON_PRIMARY },
  quote: { ...GgastosType.micro, color: ON_PRIMARY_SOFT },
  searchButton: {
    width: SEARCH_BUTTON_SIZE,
    height: SEARCH_BUTTON_SIZE,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
