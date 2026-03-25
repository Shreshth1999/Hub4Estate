import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>HUB4ESTATE</Text>
      <ActivityIndicator color={colors.primary[500]} size="large" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 4,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 8,
  },
});
