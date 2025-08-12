import React from 'react'
import { StyleSheet, View } from 'react-native'
import { DateUtils } from '@common/utils/dateUtils'
import { Months } from '@constants/index'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { useDateContext } from '../../../contexts/DateContext'
import { Balance } from './Balance'
import { MonthSelector } from './MonthSelector'
import { YearSelector } from './YearSelector'

export const MonthHeader: React.FC = () => {
  const theme = useAppTheme()
  const { dateSelection, updateMonth, updateYear } = useDateContext()

  const years = DateUtils.getYearRange(2024)

  return (
    <View style={styles(theme).container}>
      <MonthSelector
        months={Months}
        selectedMonth={dateSelection.selectedMonth}
        onSelectMonth={updateMonth}
      />
      <YearSelector
        years={years}
        selectedYear={dateSelection.selectedYear}
        onSelectYear={updateYear}
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
