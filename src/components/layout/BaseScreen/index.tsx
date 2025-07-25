import { useAppTheme } from '@theme/hooks/useAppTheme'
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
  safeArea = true,
}) => {
  const theme = useAppTheme()

  const Container = safeArea ? SafeAreaView : View
  const Content = scrollable ? ScrollView : View

  return (
    <Container
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <StatusBar barStyle={'light-content'} />

      {headerComponent}

      <Content
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background,
            paddingHorizontal: paddingHorizontal ?? 16,
            paddingVertical: paddingVertical ?? 16,
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
