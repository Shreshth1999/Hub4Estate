import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loading({ message, fullScreen = false }: LoadingProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={colors.primary[500]} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    color: colors.neutral[500],
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
