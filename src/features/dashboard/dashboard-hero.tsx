import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GgastosSpacing } from '@/shared/theme/ggastos-theme';
import { HeroHeader } from '@/shared/ui/cards/hero-header';
import { WalletHeader } from '@/shared/ui/cards/wallet-header';
import { GreetingHeader } from '@/features/dashboard/greeting-header';
import { HeroSearchButton, SEARCH_BUTTON_SIZE } from '@/features/dashboard/hero-search-button';
import type { CollapsingHeader } from '@/features/dashboard/use-collapsing-header';

export const HERO_GAP = GgastosSpacing.space3;
// Space kept free at the right of the texts for the search button.
const SEARCH_RESERVED_WIDTH = SEARCH_BUTTON_SIZE + GgastosSpacing.space3;

type DashboardHeroProps = {
  collapse: CollapsingHeader;
  greeting: { title: string; quote: string };
  wallet: { value: string; isNegative: boolean };
  onPressWallet: () => void;
  onPressSearch: () => void;
};

// Greeting and wallet on the primary color. Scrolling slides the block up so the greeting leaves
// and the wallet stays at the top; the search button never moves and ends up level with the wallet.
export function DashboardHero({ collapse, greeting, wallet, onPressWallet, onPressSearch }: DashboardHeroProps) {
  const insets = useSafeAreaInsets();
  const searchTop = insets.top + GgastosSpacing.space4 + Math.max(collapse.walletHeight - SEARCH_BUTTON_SIZE, 0) / 2;

  return (
    <>
      <HeroHeader
        onLayout={collapse.onHeroLayout}
        style={[styles.hero, { transform: [{ translateY: collapse.heroTranslateY }] }]}
      >
        <Animated.View onLayout={collapse.onGreetingLayout} style={[styles.reserved, { opacity: collapse.greetingOpacity }]}>
          <GreetingHeader title={greeting.title} quote={greeting.quote} />
        </Animated.View>
        <View onLayout={collapse.onWalletLayout} style={styles.reserved}>
          <WalletHeader tone="onPrimary" value={wallet.value} isNegative={wallet.isNegative} onPressValue={onPressWallet} />
        </View>
      </HeroHeader>
      <View pointerEvents="box-none" style={[styles.searchLayer, { top: searchTop }]}>
        <HeroSearchButton onPress={onPressSearch} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  reserved: { paddingRight: SEARCH_RESERVED_WIDTH },
  searchLayer: { position: 'absolute', right: GgastosSpacing.space5, zIndex: 3 },
});
