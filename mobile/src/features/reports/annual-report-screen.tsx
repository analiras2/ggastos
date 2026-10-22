import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyStateCard } from '@/components/ggastos/cards/empty-state-card';
import { Icon } from '@/components/ggastos/core/icon';
import { GgastosColors, GgastosSpacing, GgastosType } from '@/constants/ggastos-theme';
import { AnnualMonthRow } from '@/features/reports/annual-month-row';
import { AnnualCategoryDonut } from '@/features/reports/annual-category-donut';
import { useAnnualReportViewModel } from '@/features/reports/use-annual-report-view-model';

export function AnnualReportScreen() {
  const { year, months, categories, isLoading, isError, isEmpty, handlePrevYear, handleNextYear } =
    useAnnualReportViewModel();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Anual</Text>
          <Text style={styles.subtitle}>Consolidado do ano por mês e categoria.</Text>
        </View>

        <View style={styles.yearRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ano anterior"
            onPress={handlePrevYear}
            style={styles.chevron}
          >
            <Icon name="chevron-left" size={18} />
          </Pressable>
          <Text style={styles.year}>{year}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Próximo ano"
            onPress={handleNextYear}
            style={styles.chevron}
          >
            <Icon name="chevron-right" size={18} />
          </Pressable>
        </View>

        {isLoading ? <Text style={styles.status}>Carregando consolidado anual...</Text> : null}

        {isError ? <Text style={styles.status}>Não foi possível carregar o consolidado anual.</Text> : null}

        {!isLoading && !isError && isEmpty ? (
          <EmptyStateCard
            icon="calendar-range"
            title="Nada por aqui ainda"
            description="Feche um mês para começar a ver o consolidado anual aqui."
          />
        ) : null}

        {!isLoading && !isError && !isEmpty ? (
          <View>
            <Text style={styles.sectionTitle}>Meses</Text>
            {months.map((month) => (
              <AnnualMonthRow
                key={month.month}
                label={month.label}
                hasSnapshot={month.hasSnapshot}
                status={month.status}
                plannedIncome={month.plannedIncome}
                actualIncome={month.actualIncome}
                plannedExpense={month.plannedExpense}
                actualExpense={month.actualExpense}
              />
            ))}
          </View>
        ) : null}

        {!isLoading && !isError && categories.length > 0 ? (
          <View>
            <Text style={styles.sectionTitle}>Categorias</Text>
            <AnnualCategoryDonut categories={categories} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: GgastosColors.bgBase,
  },
  content: {
    padding: GgastosSpacing.space5,
    paddingBottom: 100,
    gap: GgastosSpacing.space4,
  },
  header: {
    gap: 4,
  },
  title: {
    ...GgastosType.displayLg,
    color: GgastosColors.inkStrong,
  },
  subtitle: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkSoft,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  chevron: {
    width: 40,
    padding: 6,
    alignItems: 'center',
  },
  year: {
    ...GgastosType.displayXl,
    color: GgastosColors.inkStrong,
  },
  status: {
    ...GgastosType.bodyMd,
    color: GgastosColors.inkFaint,
    textAlign: 'center',
    paddingVertical: 24,
  },
  sectionTitle: {
    ...GgastosType.displaySm,
    color: GgastosColors.inkStrong,
    marginBottom: 4,
  },
});
