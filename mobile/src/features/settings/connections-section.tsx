import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosRadius, GgastosType } from '@/constants/ggastos-theme';
import { ConnectAccountSheet } from '@/features/settings/connect-account-sheet';
import { ConnectionStatusRow } from '@/features/settings/connection-status-row';
import { formatConnectionStatus } from '@/features/settings/format-connection-status';
import { useConnectionsSectionViewModel } from '@/features/settings/use-connections-section-view-model';

export function ConnectionsSection() {
  const { connections, isLoading, connectSheet, handleOpenConnect, handleOpenReconnect, handleCloseSheet } =
    useConnectionsSectionViewModel();

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Conexões</Text>

      {isLoading ? <Text style={styles.helperText}>Carregando...</Text> : null}

      {!isLoading && connections.length === 0 ? (
        <Text style={styles.helperText}>Nenhuma conexão bancária ainda.</Text>
      ) : null}

      {connections.map((connection) => {
        const formatted = formatConnectionStatus(connection);
        return (
          <ConnectionStatusRow
            key={formatted.id}
            institutionName={formatted.institutionName}
            message={formatted.message}
            tone={formatted.tone}
            onReconnect={() => handleOpenReconnect(connection.id, formatted.institutionName)}
          />
        );
      })}

      <Pressable accessibilityRole="button" onPress={handleOpenConnect} style={styles.connectButton}>
        <Text style={styles.connectButtonText}>+ Conectar conta bancária</Text>
      </Pressable>

      <ConnectAccountSheet
        visible={connectSheet.visible}
        mode={connectSheet.mode}
        connectionId={connectSheet.connectionId}
        institutionName={connectSheet.institutionName}
        onClose={handleCloseSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: 4,
  },
  label: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkSoft,
  },
  helperText: {
    ...GgastosType.bodySm,
    color: GgastosColors.inkFaint,
  },
  connectButton: {
    marginTop: 8,
    borderRadius: GgastosRadius.md,
    borderWidth: 1,
    borderColor: GgastosColors.lineSoft,
    paddingVertical: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    ...GgastosType.bodySm,
    fontWeight: '700',
    color: GgastosColors.brandPrimaryDark,
  },
});
