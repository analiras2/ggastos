import { StyleSheet, Text, View } from 'react-native';

import { GgastosType } from '@/shared/theme/ggastos-theme';

const ON_PRIMARY = '#FFFFFF';
const ON_PRIMARY_SOFT = 'rgba(255, 255, 255, 0.78)';

type GreetingHeaderProps = { title: string; quote: string };

// "Olá, name" with a short money tip under it, for use over the primary color.
export function GreetingHeader({ title, quote }: GreetingHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <Text style={styles.quote}>{quote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2, paddingTop: 2 },
  title: { ...GgastosType.displaySm, color: ON_PRIMARY },
  quote: { ...GgastosType.micro, color: ON_PRIMARY_SOFT },
});
