import React from 'react'
import { StyleSheet, View } from 'react-native'
import { MonthModel } from '@/models/month/MonthModel'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { useDateContext } from '../../../contexts/DateContext'
import { Balance } from './Balance'
import { MonthSelector } from './MonthSelector'
import { YearSelector } from './YearSelector'

export const MonthHeader: React.FC = () => {
  const theme = useAppTheme()
  const { dateSelection, setSelectedMonth, setSelectedYear } = useDateContext()

  const months = MonthModel.getMonths()
  const years = MonthModel.getYearRange(2024)

  return (
    <View style={styles(theme).container}>
      <MonthSelector
        months={months}
        selectedMonth={dateSelection.selectedMonth}
        onSelectMonth={setSelectedMonth}
      />
      <YearSelector
        years={years}
        selectedYear={dateSelection.selectedYear}
        onSelectYear={setSelectedYear}
      />
      <Balance current={100} expected={2000} />
    </View>
  )
}

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      position: 'relative',
      height: 100,
      backgroundColor: theme.colors.primary,
    },
  })
