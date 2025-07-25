import { Month } from '@common/index'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Theme } from '@theme/types'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useRef } from 'react'
import { Typography } from '../Typography'
import { TypographyVariant } from '../Typography/types'

interface MonthSelectorProps {
  months: Month[]
  selectedMonth: Month
  onSelectMonth: (month: Month) => void
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selectedMonth,
  onSelectMonth,
}) => {
  const theme = useAppTheme()
  const listRef = useRef<FlatList<Month>>(null)

  useEffect(() => {
    listRef.current &&
      setTimeout(() => {
        listRef.current?.scrollToIndex({
          index:
            selectedMonth.id === 0 ? selectedMonth.id : selectedMonth.id - 1,
        })
      }, 500)
  })

  const renderItem = useCallback(
    ({ item }: { item: Month }) => {
      const isSelected = selectedMonth.id === item.id

      return (
        <TouchableOpacity
          style={styles(theme, isSelected).item}
          onPress={() => onSelectMonth(item)}
        >
          <Typography
            variant={
              isSelected ? TypographyVariant.HEADER : TypographyVariant.BODY
            }
            bold={isSelected}
            color={theme.colors.textLight}
          >
            {item.shortName}
          </Typography>
        </TouchableOpacity>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMonth, onSelectMonth]
  )

  const keyExtractor = useCallback((item: Month) => item.id.toString(), [])

  return (
    <View style={styles(theme).container}>
      <FlatList
        ref={listRef}
        data={months}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

const styles = (theme: Theme, isSelected?: boolean) =>
  StyleSheet.create({
    container: {
      marginTop: 8,
      paddingLeft: 8,
    },
    item: {
      paddingVertical: 8,
      marginTop: 0,
      marginHorizontal: 4,
      borderRadius: 20,
      backgroundColor: isSelected ? theme.colors.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
      width: theme.width / (isSelected ? 2 : 5),
    },
  })
