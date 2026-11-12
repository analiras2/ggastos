import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/shared/ui/cards/empty-state-card';
import { Icon } from '@/shared/ui/core/icon';
import { TagChips } from '@/shared/ui/core/tag-chips';
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
  const { query, setQuery, results, availableTags, selectedTag, toggleTag, hasQuery, isLoading, isError } =
    useMonthSearchViewModel(monthKey, visible);

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
                placeholder="Buscar por título ou #tag"
                placeholderTextColor={GgastosColors.inkFaint}
                accessibilityLabel="Buscar por título ou tag"
                style={styles.input}
              />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose} style={styles.closeButton}>
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          {availableTags.length > 0 ? (
            <View style={styles.tagFilter}>
              <TagChips tags={availableTags} selectedTag={selectedTag} onPressTag={toggleTag} />
            </View>
          ) : null}

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {isLoading ? <Text style={styles.status}>Carregando lançamentos...</Text> : null}
            {isError ? <Text style={styles.status}>Não foi possível carregar os lançamentos.</Text> : null}
            {!isLoading && !isError && !hasQuery ? (
              <Text style={styles.status}>Digite ou escolha uma tag para buscar entre os lançamentos do mês.</Text>
            ) : null}
            {!isLoading && !isError && hasQuery && results.length === 0 ? (
              <EmptyStateCard icon="inbox" title="Nada encontrado" description="Nenhum lançamento do mês tem esse título ou tag." />
            ) : null}
            {results.map((item) => (
              <TransactionRow
                key={item.id}
                title={item.title}
                category={item.category}
                amount={item.amount}
                kind={item.kind}
                date={item.date}
                tags={item.tags}
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
  tagFilter: { paddingHorizontal: GgastosSpacing.space5, paddingBottom: GgastosSpacing.space2 },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space2 },
  status: { ...GgastosType.bodyMd, color: GgastosColors.inkFaint, textAlign: 'center', paddingVertical: 24 },
});
