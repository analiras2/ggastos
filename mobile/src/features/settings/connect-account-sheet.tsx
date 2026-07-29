import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PluggyConnect } from 'react-native-pluggy-connect';

import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { Icon } from '@/components/ggastos/core/icon';
import {
  useConnectAccountViewModel,
  type ConnectAccountMode,
} from '@/features/settings/use-connect-account-view-model';

type ConnectAccountSheetProps = {
  visible: boolean;
  mode: ConnectAccountMode;
  connectionId?: string | null;
  institutionName?: string | null;
  onClose: () => void;
};

export function ConnectAccountSheet({
  visible,
  mode,
  connectionId = null,
  institutionName = null,
  onClose,
}: ConnectAccountSheetProps) {
  const {
    connectToken,
    updateItemId,
    isLoadingToken,
    tokenErrorMessage,
    errorMessage,
    isLinking,
    handleWidgetSuccess,
    handleWidgetError,
    handleWidgetClose,
  } = useConnectAccountViewModel(visible, mode, connectionId, onClose);

  const title = mode === 'reconnect' ? `Reconectar ${institutionName ?? 'conta'}` : 'Conectar conta bancária';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.screen} edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Icon name="x" size={18} />
            </Pressable>
          </View>

          {connectToken ? (
            <PluggyConnect
              connectToken={connectToken}
              updateItem={updateItemId}
              includeSandbox
              onSuccess={handleWidgetSuccess}
              onError={handleWidgetError}
              onClose={handleWidgetClose}
            />
          ) : (
            <View style={styles.centerContent}>
              {isLoadingToken || isLinking ? (
                <ActivityIndicator size="large" color={GgastosColors.brandPrimary} />
              ) : null}
              {tokenErrorMessage || errorMessage ? (
                <Text style={styles.errorText}>{tokenErrorMessage ?? errorMessage}</Text>
              ) : null}
            </View>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GgastosSpacing.space5,
    paddingVertical: GgastosSpacing.space4,
    borderBottomWidth: 1,
    borderBottomColor: GgastosColors.lineSofter,
  },
  title: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
  },
  closeButton: {
    padding: 6,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: GgastosSpacing.space4,
    paddingHorizontal: GgastosSpacing.space5,
  },
  errorText: {
    ...GgastosType.bodySm,
    color: GgastosColors.expense,
    textAlign: 'center',
  },
});
