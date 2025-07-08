import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  ViewStyle, 
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '@theme/index';

interface BaseScreenProps {
  children: React.ReactNode;
  headerComponent?: React.ReactNode;
  scrollable?: boolean;
  paddingHorizontal?: number;
  paddingVertical?: number;
  style?: ViewStyle;
  backgroundColor?: string;
  safeArea?: boolean;
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
  const theme = useTheme() as Theme;

  const Container = safeArea ? SafeAreaView : View;
  const Content = scrollable ? ScrollView : View;

  return (
    <Container style={[
      styles.container,
      { backgroundColor: backgroundColor || theme.colors.background },
    ]}>
      <StatusBar 
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor || theme.colors.background}
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
  );
};

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
});
