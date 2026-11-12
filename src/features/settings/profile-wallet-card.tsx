import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const ON_PRIMARY = '#FFFFFF';
const ON_PRIMARY_SOFT = 'rgba(255, 255, 255, 0.78)';
const ON_PRIMARY_FILL = 'rgba(255, 255, 255, 0.18)';
const BADGE_SIZE = 44;
const EDIT_ICON_SIZE = 18;
const EDIT_TOUCH_SIZE = 44;
const VALUE_FONT_SIZE = 28;
const VALUE_LINE_HEIGHT = 32;

type ProfileWalletCardProps = {
  isConfigured: boolean;
  balanceCents: number;
  onPress: () => void;
};

// The wallet at the top of the profile; the pencil on the right lets the user correct the balance.
export function ProfileWalletCard({ isConfigured, balanceCents, onPress }: ProfileWalletCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Icon name="wallet" size={22} color={ON_PRIMARY} />
      </View>
      <View style={styles.texts}>
        <Text style={styles.label}>Carteira</Text>
        <Text style={styles.value} numberOfLines={1}>{isConfigured ? formatCurrencyCents(balanceCents) : 'Sem saldo'}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isConfigured ? 'Ajustar saldo da carteira' : 'Informar saldo da carteira'}
        onPress={onPress}
        style={styles.editButton}
      >
        <Icon name="pencil" size={EDIT_ICON_SIZE} color={ON_PRIMARY} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space4,
    padding: GgastosSpacing.space5,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.brandPrimary,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: ON_PRIMARY_FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  label: { ...GgastosType.labelCaps, color: ON_PRIMARY_SOFT },
  value: { ...GgastosType.displayLg, fontSize: VALUE_FONT_SIZE, lineHeight: VALUE_LINE_HEIGHT, color: ON_PRIMARY },
  editButton: {
    width: EDIT_TOUCH_SIZE,
    height: EDIT_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
