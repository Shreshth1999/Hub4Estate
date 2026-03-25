import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  containerStyle?: object;
}

export default function Input({
  label,
  error,
  rightElement,
  containerStyle,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && styles.focused,
          error ? styles.errorBorder : null,
        ]}
      >
        <TextInput
          {...props}
          style={[styles.input, props.style]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.neutral[400]}
        />
        {rightElement && <View style={styles.rightEl}>{rightElement}</View>}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: 8,
    backgroundColor: colors.neutral[50],
  },
  focused: {
    borderColor: colors.primary[500],
    backgroundColor: colors.white,
  },
  errorBorder: {
    borderColor: colors.red[600],
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.neutral[900],
  },
  rightEl: {
    paddingRight: 12,
  },
  error: {
    color: colors.red[600],
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
