import { StyleSheet, Text, View } from 'react-native';

import { GgastosColors, GgastosType } from '@/constants/ggastos-theme';
import { ConnectionStatusRow } from '@/features/settings/connection-status-row';
import { formatConnectionStatus } from '@/features/settings/format-connection-status';
import { useConnectionsStatus } from '@/features/settings/use-connections-status';

export function ConnectionsSection() {
  const { data: connections, isLoading } = useConnectionsStatus();

  return (
    <View style={styles.box}>
      <Text style={styles.label}>Conexões</Text>

      {isLoading ? <Text style={styles.helperText}>Carregando...</Text> : null}

      {!isLoading && (!connections || connections.length === 0) ? (
        <Text style={styles.helperText}>Nenhuma conexão bancária ainda.</Text>
      ) : null}

      {connections?.map((connection) => {
        const formatted = formatConnectionStatus(connection);
        return (
          <ConnectionStatusRow
            key={formatted.id}
            institutionName={formatted.institutionName}
            message={formatted.message}
            tone={formatted.tone}
          />
        );
      })}
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
});
