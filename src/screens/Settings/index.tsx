import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SettingsScreen = () => {
  const theme = useAppTheme()
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Settings Screen
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

export default SettingsScreen
