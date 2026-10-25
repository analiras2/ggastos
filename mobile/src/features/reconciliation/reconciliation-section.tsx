import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import type { ReconciliationSuggestionView } from '@/features/reconciliation/format-reconciliation';
import { ReconciliationSuggestionRow } from '@/features/reconciliation/reconciliation-suggestion-row';

type ReconciliationSectionProps = {
  suggestions: ReconciliationSuggestionView[];
  pendingTransactionId: string | null;
  onConfirm: (suggestion: ReconciliationSuggestionView) => void;
  onReject: (suggestion: ReconciliationSuggestionView) => void;
};

export function ReconciliationSection({
  suggestions,
  pendingTransactionId,
  onConfirm,
  onReject,
}: ReconciliationSectionProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.title}>Conciliações</Text>
        <Text style={styles.subtitle}>Confirme ou rejeite as correspondências sugeridas.</Text>
      </View>
      {suggestions.map((suggestion) => (
        <ReconciliationSuggestionRow
          key={suggestion.transactionId}
          suggestion={suggestion}
          isPending={pendingTransactionId === suggestion.transactionId}
          onConfirm={onConfirm}
          onReject={onReject}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: GgastosSpacing.space3, paddingTop: GgastosSpacing.space5 },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
});
