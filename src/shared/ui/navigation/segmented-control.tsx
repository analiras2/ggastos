import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/shared/theme/ggastos-theme';

export type SegmentOption<Key extends string> = { key: Key; label: string; badge?: number };

type SegmentedControlProps<Key extends string> = {
  options: SegmentOption<Key>[];
  value: Key;
  onChange: (key: Key) => void;
};

const SEGMENT_HEIGHT = 44;
const SEGMENT_INSET = 4;

// Two-or-three option switch used to split one screen into sections.
export function SegmentedControl<Key extends string>({ options, value, onChange }: SegmentedControlProps<Key>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const isActive = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.key)}
            style={[styles.segment, isActive && styles.activeSegment]}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>{option.label}</Text>
            {!!option.badge && option.badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{option.badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: SEGMENT_INSET,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.lineSofter,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT - SEGMENT_INSET * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: GgastosRadius.pill,
  },
  activeSegment: { backgroundColor: GgastosColors.bgSurfaceRaised },
  label: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft, fontWeight: '600' },
  activeLabel: { color: GgastosColors.brandPrimary },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: GgastosRadius.pill,
    backgroundColor: GgastosColors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeLabel: { ...GgastosType.micro, color: '#FFFFFF' },
});
