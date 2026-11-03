import { StyleSheet, Text, TextInput, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Button } from '@/components/ggastos/core/button';
import { useOpeningBalanceViewModel } from '@/features/opening-balance/use-opening-balance-view-model';

type OpeningBalanceCardProps = {
  monthKey: string;
};

export function OpeningBalanceCard({ monthKey }: OpeningBalanceCardProps) {
  const viewModel = useOpeningBalanceViewModel(monthKey);

  if (viewModel.isLoading) {
    return null;
  }

  if (viewModel.isEditing) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Saldo inicial (use - para saldo negativo)</Text>
        <TextInput
          autoFocus
          keyboardType="numbers-and-punctuation"
          onChangeText={viewModel.setInputText}
          placeholder="R$ 0,00"
          placeholderTextColor={GgastosColors.inkFaint}
          style={styles.input}
          value={viewModel.maskedInput}
        />
        <View style={styles.actions}>
          <Button size="sm" disabled={viewModel.isBusy} onPress={viewModel.handleSaveEditing}>Salvar</Button>
          <Button size="sm" variant="ghost" onPress={viewModel.handleCancelEditing}>Cancelar</Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Saldo inicial</Text>
      {viewModel.hasOpening ? (
        <>
          <Text style={styles.value}>{viewModel.openingValue}</Text>
          <Text style={styles.caption}>{viewModel.sourceLabel}</Text>
          {viewModel.isStale ? (
            <Text style={styles.warning}>
              {`${viewModel.previousMonthName} mudou: agora fecha em ${viewModel.previousMonthClosing}.`}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {viewModel.isStale ? (
              <Button size="sm" disabled={viewModel.isBusy} onPress={viewModel.handleCarryOver}>Atualizar</Button>
            ) : null}
            <Button size="sm" variant="secondary" onPress={viewModel.handleStartEditing}>Editar</Button>
            <Button size="sm" variant="ghost" disabled={viewModel.isBusy} onPress={viewModel.handleClear}>Remover</Button>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.caption}>
            Este mês começa do zero. Traga o saldo do mês anterior quando seus lançamentos estiverem corretos.
          </Text>
          <View style={styles.actions}>
            <Button size="sm" disabled={viewModel.isBusy} onPress={viewModel.handleCarryOver}>
              {`Trazer de ${viewModel.previousMonthName} (${viewModel.previousMonthClosing})`}
            </Button>
            <Button size="sm" variant="secondary" onPress={viewModel.handleStartEditing}>Informar valor</Button>
          </View>
        </>
      )}
      {viewModel.hasMutationError ? (
        <Text style={styles.warning}>Não foi possível salvar o saldo inicial.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: GgastosSpacing.space2,
    padding: GgastosSpacing.space4,
    borderRadius: GgastosRadius.md,
    borderWidth: 1,
    borderColor: GgastosColors.lineSofter,
    backgroundColor: GgastosColors.bgSurface,
  },
  label: {
    ...GgastosType.label,
    color: GgastosColors.inkFaint,
  },
  value: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  caption: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
  },
  warning: {
    ...GgastosType.bodyMd,
    color: GgastosColors.brandPrimaryDark,
  },
  input: {
    ...GgastosType.bodyMd,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.sm,
    padding: GgastosSpacing.space3,
    color: GgastosColors.inkStrong,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GgastosSpacing.space2,
  },
});
