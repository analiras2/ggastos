import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/shared/theme/ggastos-theme';
import { Icon } from '@/shared/ui/core/icon';

const CLOSE_ICON_SIZE = 18;
const CLOSE_PADDING = 6;
const CLOSE_HIT_SLOP = 12;

type SheetModalProps = {
  // Sheets that mount only while open can leave this out.
  visible?: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  // The body: usually a ScrollView or a View, rendered below the header.
  children: ReactNode;
};

// Full-screen sheet that slides up: a header with the title and a close button, then the body.
export function SheetModal({ visible = true, title, subtitle, onClose, children }: SheetModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={CLOSE_HIT_SLOP}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Icon name="x" size={CLOSE_ICON_SIZE} />
            </Pressable>
          </View>
          {children}
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
    gap: GgastosSpacing.space3,
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  titleGroup: { flex: 1 },
  title: { ...GgastosType.displaySm, color: GgastosColors.inkStrong },
  subtitle: { ...GgastosType.bodySm, color: GgastosColors.inkSoft },
  closeButton: { padding: CLOSE_PADDING },
});
