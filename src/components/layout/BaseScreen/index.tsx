import { useTheme } from '@theme/hooks/useTheme'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import React from 'react'

interface BaseScreenProps {
  children: React.ReactNode
  headerComponent?: React.ReactNode
  scrollable?: boolean
  paddingHorizontal?: number
  paddingVertical?: number
  style?: ViewStyle
  backgroundColor?: string
  safeArea?: boolean
}

export const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  headerComponent,
  scrollable = false,
  paddingHorizontal,
  paddingVertical,
  style,
  backgroundColor,
  safeArea = true,
}) => {
  const theme = useTheme()

  const Container = safeArea ? SafeAreaView : View
  const Content = scrollable ? ScrollView : View

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: backgroundColor || theme.colors.background },
      ]}
    >
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={backgroundColor || theme.colors.primary}
      />

      {headerComponent}

      <Content
        style={[
          styles.content,
          {
            paddingHorizontal: paddingHorizontal ?? theme.spacing.md,
            paddingVertical: paddingVertical ?? theme.spacing.md,
          },
          style,
        ]}
        contentContainerStyle={scrollable ? styles.scrollContent : undefined}
      >
        {children}
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
})
