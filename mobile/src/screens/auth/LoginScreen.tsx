import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation, route }: Props) {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignup = route.params?.type === 'user';

  async function handleSendOTP(otpType: 'login' | 'signup') {
    setError('');
    const trimmed = value.trim();

    if (!trimmed) {
      setError(`Please enter your ${mode}`);
      return;
    }

    if (mode === 'phone' && !/^[6-9]\d{9}$/.test(trimmed)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    if (mode === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP({
        [mode]: mode === 'phone' ? trimmed : undefined,
        email: mode === 'email' ? trimmed : undefined,
        type: otpType,
      });

      navigation.navigate('OTPVerify', {
        [mode]: mode === 'phone' ? trimmed : undefined,
        email: mode === 'email' ? trimmed : undefined,
        otpType,
        identifierType: mode,
      } as any);
    } catch (err: any) {
      const msg = err.message || '';
      // If trying login but user not found, prompt to sign up
      if (otpType === 'login' && msg.includes('No account found')) {
        Alert.alert(
          'Account Not Found',
          'No account exists with this contact. Would you like to sign up?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Up', onPress: () => handleSendOTP('signup') },
          ]
        );
      } else {
        setError(msg || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Enter your number or email to receive an OTP</Text>

          <View style={styles.modeToggle}>
            {(['phone', 'email'] as const).map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
                onPress={() => { setMode(m); setValue(''); setError(''); }}
              >
                <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>
                  {m === 'phone' ? '📱 Phone' : '📧 Email'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={mode === 'phone' ? 'Mobile Number' : 'Email Address'}
            value={value}
            onChangeText={v => { setValue(v); setError(''); }}
            keyboardType={mode === 'phone' ? 'phone-pad' : 'email-address'}
            autoCapitalize="none"
            placeholder={mode === 'phone' ? '9876543210' : 'you@example.com'}
            maxLength={mode === 'phone' ? 10 : 100}
            error={error}
          />

          <Button
            title="Send OTP"
            onPress={() => handleSendOTP('login')}
            loading={loading}
            style={styles.cta}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>New to Hub4Estate?</Text>
            <View style={styles.line} />
          </View>

          <Button
            title="Create Account"
            variant="outline"
            onPress={() => handleSendOTP('signup')}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  back: { marginBottom: 32 },
  backText: { fontSize: 16, color: colors.primary[500], fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.neutral[500], marginBottom: 32, lineHeight: 22 },
  modeToggle: { flexDirection: 'row', marginBottom: 20, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: colors.neutral[200] },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.neutral[50] },
  modeBtnActive: { backgroundColor: colors.primary[500] },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: colors.neutral[500] },
  modeBtnTextActive: { color: colors.white },
  cta: { marginTop: 4 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: colors.neutral[200] },
  orText: { marginHorizontal: 12, fontSize: 13, color: colors.neutral[500] },
});
