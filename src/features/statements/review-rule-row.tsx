import { StyleSheet, Switch, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

const TEXT_GAP = 2;

type ReviewRuleRowProps = {
  canSaveAsRule: boolean;
  saveAsRule: boolean;
  onChange: (value: boolean) => void;
};

export function ReviewRuleRow({ canSaveAsRule, saveAsRule, onChange }: ReviewRuleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textGroup}>
        <Text style={styles.title}>Usar nas próximas faturas</Text>
        <Text style={styles.description}>
          {canSaveAsRule
            ? 'Cria uma regra para este estabelecimento.'
            : 'Descrição genérica demais para criar uma regra.'}
        </Text>
      </View>
      <Switch disabled={!canSaveAsRule} value={saveAsRule && canSaveAsRule} onValueChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    backgroundColor: GgastosColors.bgSurface,
  },
  textGroup: { flex: 1, gap: TEXT_GAP },
  title: { ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  description: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
