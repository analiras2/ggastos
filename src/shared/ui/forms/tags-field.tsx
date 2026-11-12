import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

type TagsFieldProps = { value: string; onChange: (value: string) => void };

// Same "#tag #outra" format as the new entry form.
export function TagsField({ value, onChange }: TagsFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Tags</Text>
      <TextInput
        autoCapitalize="none"
        onChangeText={onChange}
        placeholder="#irmã #eletronico"
        placeholderTextColor={GgastosColors.inkFaint}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  input: {
    ...GgastosType.bodyMd,
    minHeight: 44,
    paddingHorizontal: GgastosSpacing.space4,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    borderRadius: GgastosRadius.md,
    backgroundColor: GgastosColors.bgSurface,
    color: GgastosColors.inkStrong,
  },
});
