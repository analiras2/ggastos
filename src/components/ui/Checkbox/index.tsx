import { useAppTheme } from '@theme/hooks/useAppTheme'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'

interface CheckBoxProps {
  checked: boolean
  accentColor: string
  onPress: () => void
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  accentColor,
  onPress,
}) => {
  const theme = useAppTheme()
  const backgroundColor = checked ? accentColor : 'transparent'
  const borderColor = checked ? accentColor : theme.colors.border
  const styles = createStyles(backgroundColor, borderColor)

  return (
    <View style={styles.border}>
      <TouchableOpacity style={styles.container} onPress={onPress} />
    </View>
  )
}

const createStyles = (backgroundColor: string, borderColor: string) =>
  StyleSheet.create({
    border: {
      height: 20,
      width: 20,
      borderWidth: 1,
      borderRadius: 10,
      borderColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      height: 14,
      width: 14,
      backgroundColor,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
