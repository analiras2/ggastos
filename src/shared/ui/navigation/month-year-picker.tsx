import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';
import { buildMonthKey, MONTH_LABELS, parseMonthKey } from '@/shared/lib/month';

const MONTH_ABBREVIATION_LENGTH = 3;
const MAX_CARD_WIDTH = 360;
const BACKDROP_COLOR = 'rgba(31, 26, 23, 0.4)';

type MonthYearPickerProps = {
  visible: boolean;
  monthKey: string;
  onSelect: (monthKey: string) => void;
  onClose: () => void;
};

export function MonthYearPicker({ visible, monthKey, onSelect, onClose }: MonthYearPickerProps) {
  const selected = parseMonthKey(monthKey);
  const [displayedYear, setDisplayedYear] = useState(selected.year);

  const handleShow = () => setDisplayedYear(selected.year);

  const handleSelectMonth = (monthIndex: number) => {
    onSelect(buildMonthKey(displayedYear, monthIndex));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onShow={handleShow} onRequestClose={onClose}>
      <Pressable accessibilityLabel="Fechar seletor" style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <View style={styles.yearRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ano anterior"
              hitSlop={8}
              onPress={() => setDisplayedYear((year) => year - 1)}
              style={styles.yearArrow}
            >
              <Icon name="chevron-left" size={18} />
            </Pressable>
            <Text style={styles.yearText}>{displayedYear}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Próximo ano"
              hitSlop={8}
              onPress={() => setDisplayedYear((year) => year + 1)}
              style={styles.yearArrow}
            >
              <Icon name="chevron-right" size={18} />
            </Pressable>
          </View>
          <View style={styles.grid}>
            {MONTH_LABELS.map((label, monthIndex) => {
              const isSelected = displayedYear === selected.year && monthIndex === selected.monthIndex;
              return (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={`${label} ${displayedYear}`}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => handleSelectMonth(monthIndex)}
                  style={[styles.monthCell, isSelected && styles.monthCellSelected]}
                >
                  <Text style={[styles.monthText, isSelected && styles.monthTextSelected]}>
                    {label.slice(0, MONTH_ABBREVIATION_LENGTH)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: BACKDROP_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: GgastosSpacing.space5,
  },
  card: {
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
    gap: GgastosSpacing.space4,
    padding: GgastosSpacing.space5,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    ...GgastosShadow.card,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearArrow: {
    width: 36,
    height: 36,
    borderRadius: GgastosRadius.pill,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearText: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GgastosSpacing.space2,
  },
  monthCell: {
    flexBasis: '30%',
    flexGrow: 1,
    paddingVertical: GgastosSpacing.space4,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgBase,
    alignItems: 'center',
  },
  monthCellSelected: {
    backgroundColor: GgastosColors.brandPrimary,
  },
  monthText: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  monthTextSelected: {
    color: GgastosColors.bgSurfaceRaised,
  },
});
