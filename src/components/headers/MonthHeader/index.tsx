import { DateUtils } from '@common/utils/dateUtils'
import { MonthSelector, YearSelector } from '@components/ui'
import { Months } from '@constants/index'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { StyleSheet, View } from 'react-native'
import React from 'react'
import { useDateContext } from '../../../contexts/DateContext'

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
    </View>
  )
}

const styles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      height: 100,
      backgroundColor: theme.colors.primary,
    },
  })
