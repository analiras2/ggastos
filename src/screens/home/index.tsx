import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '@theme/index';

export const HomeScreen = () => {
  const theme = useTheme() as unknown as Theme;

  return (
    <View style={[styles.container]}>
      <Text style={[styles.text, { color: theme.colors.text }]}>Home Screen</Text>
    </View>
  );
};

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
});

export default HomeScreen;
