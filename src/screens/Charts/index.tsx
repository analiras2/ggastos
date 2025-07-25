import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ChartScreen = () => {
  const theme = useAppTheme()

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Chart Screen
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
})

export default ChartScreen
