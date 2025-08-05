import { Typography } from '@components/ui'
import { Strings } from '@constants/strings'
import { useAppTheme } from '@theme/hooks/useAppTheme'
import { Colors } from '@theme/types'
import { StyleSheet, View } from 'react-native'
import React from 'react'

interface SimpleHeaderProps {
  title: string
  testID?: string
}

const SimpleHeader = ({
  title,
  testID = 'simple-header',
}: SimpleHeaderProps) => {
  const { colors } = useAppTheme()
  const styles = createStyles(colors)

  return (
    <View style={styles.container} testID={`${testID}-container`}>
      <Typography
        variant="header"
        bold
        color={colors.title}
        align="center"
        marginBottom={8}
      >
        {Strings.appName}
      </Typography>
      <Typography variant="title" color={colors.title} bold>
        {title}
      </Typography>
    </View>
  )
}

export default SimpleHeader

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      height: 100,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
  })
