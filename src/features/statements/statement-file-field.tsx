import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/shared/ui/core/icon';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

type StatementFileFieldProps = {
  fileName: string | null;
  isBusy: boolean;
  onPick: () => void;
  onClear: () => void;
};

// The CSV picker row: shows the chosen file and lets the user swap or remove it.
export function StatementFileField({ fileName, isBusy, onPick, onClear }: StatementFileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>CSV</Text>
      <View style={styles.fileButton}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fileName ? 'Trocar arquivo CSV' : 'Selecionar arquivo CSV'}
          disabled={isBusy}
          onPress={onPick}
          style={styles.filePickerTrigger}
        >
          <Icon name="file-up" size={20} />
          <View style={styles.fileTextGroup}>
            <Text style={styles.fileTitle}>{fileName ?? 'Selecionar arquivo'}</Text>
            <Text style={styles.fileCaption}>
              {fileName ? 'Toque para trocar o arquivo' : 'Nubank ou Bradesco em .csv'}
            </Text>
          </View>
        </Pressable>

        {fileName ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remover arquivo selecionado"
            disabled={isBusy}
            hitSlop={12}
            onPress={onClear}
            style={styles.removeFileButton}
          >
            <Icon name="x" size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: GgastosSpacing.space2,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkSoft,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  filePickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
  },
  removeFileButton: {
    padding: GgastosSpacing.space2,
  },
  fileTextGroup: {
    flex: 1,
    gap: 2,
  },
  fileTitle: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkStrong,
  },
  fileCaption: {
    ...GgastosType.micro,
    color: GgastosColors.inkFaint,
  },
});
