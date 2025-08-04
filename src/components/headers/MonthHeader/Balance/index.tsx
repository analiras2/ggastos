import { LabeledItem } from '@components/LabeledItem'
import { RoundedView } from '@components/RoundedView'
import { Strings } from '@constants/strings'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Colors } from '@theme/types'
import { StyleSheet, View } from 'react-native'
import React from 'react'

interface BalanceProps {
  expected: number
  current: number
  testID?: string
}

export const Balance: React.FC<BalanceProps> = ({
  expected,
  current,
  testID,
}) => {
  const { colors } = useAppTheme()
  const st = styles(colors)

  return (
    <View style={st.container}>
      <RoundedView testID={testID}>
        <View style={st.content}>
          <LabeledItem
            label={Strings.expectedBalance}
            value={expected}
            variant="title"
          />
          <View style={st.divider} />
          <LabeledItem
            label={Strings.currentBalance}
            value={current}
            variant="header"
          />
        </View>
      </RoundedView>
    </View>
  )
}

const styles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 76,
      zIndex: 99,
    },
    content: {
      flexDirection: 'row',
    },
    divider: {
      backgroundColor: colors.border,
      height: 44,
      width: 1,
    },
  })
