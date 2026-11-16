import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosShadow, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';

const BACKDROP_COLOR = 'rgba(31, 26, 23, 0.4)';
const MAX_CARD_WIDTH = 340;
const BUTTON_HEIGHT = 48;

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  // Paints the confirm button as a destructive action.
  isDestructive?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Centered card over a dimmed screen that asks the person to confirm an action before it happens.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  isDestructive = false,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable accessibilityLabel="Fechar" style={styles.backdrop} onPress={isBusy ? undefined : onCancel}>
        <Pressable accessibilityRole="alert" style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={isBusy} onPress={onCancel} style={[styles.button, styles.cancel]}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isBusy}
              onPress={onConfirm}
              style={[styles.button, isDestructive ? styles.destructive : styles.primary, isBusy && styles.busy]}
            >
              <Text style={styles.confirmLabel}>{isBusy ? 'Aguarde...' : confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: BACKDROP_COLOR, alignItems: 'center', justifyContent: 'center', padding: GgastosSpacing.space5 },
  card: {
    width: '100%',
    maxWidth: MAX_CARD_WIDTH,
    gap: GgastosSpacing.space3,
    padding: GgastosSpacing.space5,
    borderRadius: GgastosRadius.lg,
    backgroundColor: GgastosColors.bgSurfaceRaised,
    ...GgastosShadow.card,
  },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  message: { ...GgastosType.bodyMd, color: GgastosColors.inkSoft },
  actions: { flexDirection: 'row', gap: GgastosSpacing.space3, marginTop: GgastosSpacing.space2 },
  button: { flex: 1, height: BUTTON_HEIGHT, alignItems: 'center', justifyContent: 'center', borderRadius: GgastosRadius.pill },
  cancel: { backgroundColor: GgastosColors.lineSofter },
  primary: { backgroundColor: GgastosColors.brandPrimary },
  destructive: { backgroundColor: GgastosColors.expense },
  busy: { opacity: 0.6 },
  cancelLabel: { ...GgastosType.bodyMd, fontWeight: '700', color: GgastosColors.inkStrong },
  confirmLabel: { ...GgastosType.bodyMd, fontWeight: '700', color: '#FFFFFF' },
});
