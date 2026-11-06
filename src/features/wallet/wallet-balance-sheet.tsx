import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosRadius, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Button } from '@/shared/ui/core/button';
import { Icon } from '@/shared/ui/core/icon';
import { useWalletBalanceForm } from '@/features/wallet/use-wallet-balance-form';

export type WalletSheetMode = 'setup' | 'adjust' | 'close';

type WalletBalanceSheetProps = {
  visible: boolean;
  mode: WalletSheetMode;
  currentCents: number;
  // Month being closed ("Novembro"), used by the "close" mode.
  monthName?: string;
  onClose: () => void;
  // Called after the balance was saved (or confirmed as it is).
  onDone: () => void;
};

const COPY: Record<WalletSheetMode, { title: (month?: string) => string; description: string; confirm: string }> = {
  setup: {
    title: () => 'Saldo da carteira',
    description:
      'Informe quanto você tem hoje. A partir daqui a carteira acompanha o que você pagar e receber. Faturas de meses anteriores entram só no histórico e não alteram esse valor.',
    confirm: 'Salvar',
  },
  adjust: {
    title: () => 'Ajustar carteira',
    description: 'Informe o saldo real de hoje para corrigir qualquer diferença.',
    confirm: 'Salvar',
  },
  close: {
    title: (month) => `Fechar ${month ?? 'o mês'}`,
    description: 'O saldo da carteira bate com o que você tem de verdade? Corrija se precisar antes de fechar.',
    confirm: 'Confirmar e fechar',
  },
};

// Mounted only while open, so the field always starts from the current balance.
export function WalletBalanceSheet(props: WalletBalanceSheetProps) {
  return props.visible ? <WalletBalanceSheetContent {...props} /> : null;
}

function WalletBalanceSheetContent({ mode, currentCents, monthName, onClose, onDone }: WalletBalanceSheetProps) {
  const form = useWalletBalanceForm(currentCents, onDone);
  const copy = COPY[mode];

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>{copy.title(monthName)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" hitSlop={12} onPress={onClose}>
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>{copy.description}</Text>
            <View style={styles.field}>
              <Text style={styles.label}>Saldo atual (use - para negativo)</Text>
              <TextInput
                autoFocus
                keyboardType="numbers-and-punctuation"
                onChangeText={form.setText}
                placeholder="R$ 0,00"
                placeholderTextColor={GgastosColors.inkFaint}
                style={styles.input}
                value={form.maskedValue}
              />
            </View>
            {form.errorMessage ? <Text style={styles.error}>{form.errorMessage}</Text> : null}
            <Button fullWidth disabled={form.isSaving} onPress={form.handleSave}>
              {form.isSaving ? 'Salvando...' : copy.confirm}
            </Button>
            {mode === 'close' ? (
              <Button fullWidth variant="ghost" disabled={form.isSaving} onPress={onDone}>
                Fechar sem ajustar
              </Button>
            ) : null}
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  content: { padding: GgastosSpacing.space5, gap: GgastosSpacing.space4 },
  description: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft },
  field: { gap: GgastosSpacing.space2 },
  label: { ...GgastosType.label, color: GgastosColors.inkSoft },
  input: {
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    borderRadius: GgastosRadius.md,
    paddingHorizontal: GgastosSpacing.space4,
    paddingVertical: GgastosSpacing.space3,
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    backgroundColor: GgastosColors.bgSurface,
  },
  error: { ...GgastosType.bodySm, color: GgastosColors.expense },
});
