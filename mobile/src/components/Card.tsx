import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'bordered' | 'flat';
  padding?: number;
}

export default function Card({ children, style, variant = 'default', padding = 16 }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding },
        variant === 'default' && styles.shadow,
        variant === 'bordered' && styles.bordered,
        variant === 'flat' && styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bordered: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  flat: {
    backgroundColor: colors.neutral[50],
  },
});
