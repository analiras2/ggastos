import { Strings } from '@constants/strings'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Colors } from '@theme/types'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Selector } from '../../ui/Selectors/Selector'
import { Typography } from '../../ui/Typography'

interface YearSelectorProps {
  years: number[]
  selectedYear: number
  onSelectYear: (year: number) => void
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  years,
  selectedYear,
  onSelectYear,
}) => {
  const { colors } = useAppTheme()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const toggleModal = useCallback(() => {
    setIsModalVisible((prev) => !prev)
  }, [])

  const handleYearSelect = useCallback(
    (year: number) => {
      onSelectYear(year)
      setIsModalVisible(false)
    },
    [onSelectYear]
  )

  const st = styles(colors)

  return (
    <View style={st.container}>
      <TouchableOpacity onPress={toggleModal}>
        <Typography variant="title" color={colors.textLight}>
          {selectedYear}
        </Typography>
      </TouchableOpacity>
      <Selector
        visible={isModalVisible}
        title={Strings.selectTheYear}
        items={years.map((year) => ({ id: year, title: year }))}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleYearSelect(item.id)}>
            <Typography variant="title" style={st.item}>
              {item.title}
            </Typography>
          </TouchableOpacity>
        )}
        onDismiss={() => setIsModalVisible(false)}
      />
    </View>
  )
}

const styles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.modalBackground,
    },
    item: {
      padding: 8,
    },
  })
