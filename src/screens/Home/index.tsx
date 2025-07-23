import { useTheme } from '@theme/hooks/useTheme'
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomeScreen = () => {
  const theme = useTheme()

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Home Screen
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

export default HomeScreen
