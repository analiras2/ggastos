import { StyleSheet, Text, View } from 'react-native';

import { GgastosRadius, GgastosType, StatusChipColors, StatusChipStatus } from '@/constants/ggastos-theme';

type StatusChipProps = {
  status: StatusChipStatus;
};

export function StatusChip({ status }: StatusChipProps) {
  const colors = StatusChipColors[status];

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.fg }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: GgastosRadius.pill,
  },
  label: {
    ...GgastosType.labelCaps,
  },
});
