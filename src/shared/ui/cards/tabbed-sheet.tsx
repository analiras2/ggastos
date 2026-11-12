import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

const TAB_HEIGHT = 48;
const CORNER = GgastosRadius.lg;
// Half the tab height on both curves makes one smooth S from the tab's top edge down to the body.
const TAB_CURVE = TAB_HEIGHT / 2;

type TabbedSheetProps = {
  title: string;
  // Sits on the page background, to the right of the white tab.
  caption?: string;
  children: ReactNode;
};

// White sheet whose top-left is a tab with the title; the caption stays outside, on the page
// background, and a curved notch joins the tab to the body.
export function TabbedSheet({ title, caption, children }: TabbedSheetProps) {
  return (
    <View>
      <View style={styles.tabRow}>
        <View style={styles.tab}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Svg width={TAB_CURVE} height={TAB_CURVE} viewBox={`0 0 ${TAB_CURVE} ${TAB_CURVE}`} style={styles.notch}>
          <Path d={`M0 0 L0 ${TAB_CURVE} L${TAB_CURVE} ${TAB_CURVE} A${TAB_CURVE} ${TAB_CURVE} 0 0 1 0 0 Z`} fill={GgastosColors.bgSurfaceRaised} />
        </Svg>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: { height: TAB_HEIGHT, flexDirection: 'row', alignItems: 'center' },
  tab: {
    height: TAB_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: GgastosSpacing.space5,
    borderTopLeftRadius: CORNER,
    borderTopRightRadius: TAB_CURVE,
    backgroundColor: GgastosColors.bgSurfaceRaised,
  },
  notch: { alignSelf: 'flex-end' },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  caption: { ...GgastosType.label, flex: 1, textAlign: 'right', color: GgastosColors.inkFaint, paddingLeft: GgastosSpacing.space2 },
  body: {
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space2,
    borderTopRightRadius: CORNER,
    borderBottomLeftRadius: CORNER,
    borderBottomRightRadius: CORNER,
    backgroundColor: GgastosColors.bgSurfaceRaised,
  },
});
