import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

export default function OTPVerifyScreen({ navigation, route }: Props) {
  const { phone, email, otpType, identifierType } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(30);
  const inputs = useRef<TextInput[]>([]);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleOTPChange(text: string, index: number) {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits are filled
    if (digit && index === 5 && next.every(d => d !== '')) {
      handleVerify(next.join(''));
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(code?: string) {
    const otpCode = code || otp.join('');
    if (otpCode.length < 6) {
      setError('Enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.verifyOTP({
        phone,
        email,
        otp: otpCode,
        type: otpType,
      });

      if (result.requiresProfile && result.identifier) {
        navigation.navigate('ProfileComplete', {
          identifier: result.identifier,
          identifierType: result.identifierType || identifierType,
        });
      } else if (result.token && result.user) {
        setAuth(result.user, result.token);
        // Navigation is handled by RootNavigator based on auth state
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await authService.sendOTP({ phone, email, type: otpType });
      setResendCooldown(30);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputs.current[0]?.focus();
      Alert.alert('OTP Resent', 'A new OTP has been sent.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    }
  }

  const displayIdentifier = phone || email || '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.identifier}>{displayIdentifier}</Text>
          </Text>

          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={el => { if (el) inputs.current[i] = el; }}
                style={[styles.otpBox, digit ? styles.otpBoxFilled : null, error ? styles.otpBoxError : null]}
                value={digit}
                onChangeText={t => handleOTPChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Verify OTP" onPress={() => handleVerify()} loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0} style={styles.resend}>
            <Text style={[styles.resendText, resendCooldown > 0 && styles.resendDisabled]}>
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  content: { flex: 1, padding: 24 },
  back: { marginBottom: 32 },
  backText: { fontSize: 16, color: colors.primary[500], fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.neutral[500], marginBottom: 40, lineHeight: 24 },
  identifier: { color: colors.neutral[900], fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBox: {
    width: 48, height: 56, borderWidth: 2, borderColor: colors.neutral[200],
    borderRadius: 8, textAlign: 'center', fontSize: 22, fontWeight: '700',
    color: colors.neutral[900], backgroundColor: colors.neutral[50],
  },
  otpBoxFilled: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  otpBoxError: { borderColor: colors.red[600] },
  error: { color: colors.red[600], fontSize: 13, fontWeight: '500', marginBottom: 16, textAlign: 'center' },
  btn: { marginTop: 8 },
  resend: { marginTop: 20, alignItems: 'center' },
  resendText: { fontSize: 15, color: colors.primary[500], fontWeight: '600' },
  resendDisabled: { color: colors.neutral[400] },
});
