import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { formatDateToBrazilian } from '@/features/planning/planning-form-utils';

type DateFieldProps = {
  value: Date | null;
  onChange: (date: Date) => void;
};

export function DateField({ value, onChange }: DateFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  function handleChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === 'android') {
      setIsPickerVisible(false);
    }

    if (event.type === 'set' && nextDate) {
      onChange(nextDate);
    }
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsPickerVisible(true)}
        style={styles.input}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value ? formatDateToBrazilian(value) : 'Selecionar data'}
        </Text>
      </Pressable>

      {isPickerVisible ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' && isPickerVisible ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsPickerVisible(false)}
          style={styles.doneButton}
        >
          <Text style={styles.doneButtonText}>Concluído</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    backgroundColor: GgastosColors.bgSurface,
  },
  value: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  placeholder: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: GgastosSpacing.space2,
    paddingHorizontal: GgastosSpacing.space3,
  },
  doneButtonText: {
    ...GgastosType.bodySm,
    fontWeight: '700',
    color: GgastosColors.brandPrimary,
  },
});
