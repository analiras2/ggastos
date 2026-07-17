import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { ReconciliationSuggestionRow } from '@/features/reconciliation/reconciliation-suggestion-row';
import { useReconciliationInboxViewModel } from '@/features/reconciliation/use-reconciliation-inbox-view-model';

export function ReconciliationInboxScreen() {
  const {
    suggestions,
    isLoading,
    isError,
    isEmpty,
    pendingTransactionId,
    decisionErrorMessage,
    handleConfirm,
    handleReject,
  } = useReconciliationInboxViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Revisar</Text>
          <Text style={styles.subtitle}>Confirme ou rejeite as correspondências sugeridas.</Text>
        </View>

        {isLoading ? <Text style={styles.status}>Carregando sugestões...</Text> : null}

        {isError ? (
          <Text style={styles.status}>Não foi possível carregar a caixa de conciliação.</Text>
        ) : null}

        {decisionErrorMessage ? <Text style={styles.errorBanner}>{decisionErrorMessage}</Text> : null}

        {!isLoading && !isError && isEmpty ? (
          <EmptyStateCard
            icon="check-check"
            title="Nada para revisar"
            description="Não há sugestões de conciliação pendentes neste mês."
          />
        ) : null}

        {!isLoading && !isError
          ? suggestions.map((suggestion) => (
              <ReconciliationSuggestionRow
                key={suggestion.transactionId}
                suggestion={suggestion}
                isPending={pendingTransactionId === suggestion.transactionId}
                onConfirm={handleConfirm}
                onReject={handleReject}
              />
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: 100,
    gap: GgastosSpacing.space4,
  },
  header: {
    gap: 4,
  },
  title: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  subtitle: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
  },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: 24,
  },
  errorBanner: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
  },
});
