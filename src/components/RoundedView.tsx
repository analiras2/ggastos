import React, { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { useAppTheme } from '@theme/hooks/useAppTheme'

interface RoundedViewProps {
  testID?: string
  children: ReactNode
  style?: ViewStyle
}

export const RoundedView = ({ testID, children, style }: RoundedViewProps) => {
  const { colors, width, shadowStyle } = useAppTheme()

  return (
    <View
      testID={testID || 'rounded-view'}
      style={[
        styles.container,
        { width: width - 40, backgroundColor: colors.backgroundLight },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
})
