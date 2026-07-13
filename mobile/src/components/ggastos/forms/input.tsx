import { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';

type InputProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  prefix?: ReactNode;
  helperText?: string;
  keyboardType?: TextInputProps['keyboardType'];
  secureTextEntry?: boolean;
};

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  prefix,
  helperText,
  keyboardType,
  secureTextEntry,
}: InputProps) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        {prefix}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={GgastosColors.inkFaint}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
      </View>
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GgastosColors.bgSurface,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
    padding: 0,
  },
  helper: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
});
