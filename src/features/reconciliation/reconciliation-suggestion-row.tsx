import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ggastos/core/button';
import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { ReconciliationSuggestionView } from '@/features/reconciliation/format-reconciliation';

type ReconciliationSuggestionRowProps = {
  suggestion: ReconciliationSuggestionView;
  isPending: boolean;
  onConfirm: (suggestion: ReconciliationSuggestionView) => void;
  onReject: (suggestion: ReconciliationSuggestionView) => void;
};

export function ReconciliationSuggestionRow({
  suggestion,
  isPending,
  onConfirm,
  onReject,
}: ReconciliationSuggestionRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.pair}>
        <View style={styles.side}>
          <Text style={styles.label}>Transação importada</Text>
          <Text style={styles.title} numberOfLines={1}>
            {suggestion.transactionDescription}
          </Text>
          <Text style={styles.meta}>
            {suggestion.transactionAmount} · {suggestion.transactionDate}
          </Text>
        </View>

        <View style={styles.side}>
          <Text style={styles.label}>Planejamento</Text>
          <Text style={styles.title} numberOfLines={1}>
            {suggestion.plannedEntryTitle}
          </Text>
          <Text style={styles.meta}>{suggestion.plannedEntryAmount}</Text>
        </View>
      </View>

      <Text style={styles.score}>{suggestion.scoreLabel}</Text>

      <View style={styles.actions}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isPending}
          onPress={() => onReject(suggestion)}
          style={styles.actionButton}
        >
          Rejeitar
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={isPending}
          onPress={() => onConfirm(suggestion)}
          style={styles.actionButton}
        >
          Confirmar
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GgastosColors.bgSurface,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    padding: GgastosSpacing.space4,
    gap: GgastosSpacing.space3,
  },
  pair: {
    flexDirection: 'row',
    gap: GgastosSpacing.space3,
  },
  side: {
    flex: 1,
    gap: 3,
  },
  label: {
    ...GgastosType.labelCaps,
    color: GgastosColors.inkFaint,
  },
  title: {
    ...GgastosType.bodyMd,
    fontWeight: '700',
    color: GgastosColors.inkStrong,
  },
  meta: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
  },
  score: {
    ...GgastosType.bodySm,
    color: GgastosColors.brandPrimary,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: GgastosSpacing.space2,
  },
  actionButton: {
    flex: 1,
  },
});
