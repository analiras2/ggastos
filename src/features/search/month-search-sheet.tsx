import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/shared/ui/cards/empty-state-card';
import { Icon } from '@/shared/ui/core/icon';
import { TransactionRow } from '@/shared/ui/rows/transaction-row';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { useMonthSearchViewModel } from '@/features/search/use-month-search-view-model';

type MonthSearchSheetProps = {
  visible: boolean;
  monthKey: string;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
};

const CLOSE_BUTTON_SIZE = 36;

export function MonthSearchSheet({ visible, monthKey, onSelectCategory, onClose }: MonthSearchSheetProps) {
  const { query, setQuery, results, hasQuery, isLoading, isError } = useMonthSearchViewModel(monthKey, visible);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.inputWrap}>
              <Icon name="search" size={18} color={GgastosColors.inkFaint} />
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar pelo título neste mês"
                placeholderTextColor={GgastosColors.inkFaint}
                accessibilityLabel="Buscar pelo título"
                style={styles.input}
              />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {isLoading ? <Text style={styles.status}>Carregando lançamentos...</Text> : null}
            {isError ? <Text style={styles.status}>Não foi possível carregar os lançamentos.</Text> : null}
            {!isLoading && !isError && !hasQuery ? (
              <Text style={styles.status}>Digite para buscar entre os lançamentos do mês.</Text>
            ) : null}
            {!isLoading && !isError && hasQuery && results.length === 0 ? (
              <EmptyStateCard icon="inbox" title="Nada encontrado" description="Nenhum lançamento do mês tem esse título." />
            ) : null}
            {results.map((item) => (
              <TransactionRow
                key={item.id}
                title={item.title}
                category={item.category}
                amount={item.amount}
                kind={item.kind}
                date={item.date}
                onPress={item.categoryId ? () => onSelectCategory(item.categoryId as string) : undefined}
              />
            ))}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: GgastosColors.bgBase },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space3,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GgastosSpacing.space2,
    paddingHorizontal: GgastosSpacing.space3,
    height: CLOSE_BUTTON_SIZE + GgastosSpacing.space2,
    borderRadius: GgastosSpacing.space3,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
  },
  input: { flex: 1, ...GgastosType.bodyMd, color: GgastosColors.inkStrong },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    backgroundColor: GgastosColors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space2 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkFaint, textAlign: 'center', paddingVertical: 24 },
});
