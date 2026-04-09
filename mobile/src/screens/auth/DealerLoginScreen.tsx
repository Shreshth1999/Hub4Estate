import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Linking,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'DealerLogin'>;

export default function DealerLoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.dealerLogin(email.trim().toLowerCase(), password);
      setAuth(result.dealer, result.token);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>DEALER PORTAL</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your dealer account</Text>

          <Input
            label="Business Email"
            value={email}
            onChangeText={v => { setEmail(v); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="dealer@yourbusiness.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={v => { setPassword(v); setError(''); }}
            secureTextEntry={!showPw}
            placeholder="Your password"
            rightElement={
              <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                <Text style={{ fontSize: 13, color: colors.primary[500], fontWeight: '600' }}>
                  {showPw ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            }
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Log In" onPress={handleLogin} loading={loading} style={styles.btn} />

          <TouchableOpacity
            onPress={() => Linking.openURL('https://hub4estate.com/dealer/forgot-password')}
            style={styles.forgot}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>Not registered yet?</Text><View style={styles.line} />
          </View>

          <Text style={styles.registerHint}>
            Visit hub4estate.com/dealer/onboarding to apply as a dealer.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  back: { marginBottom: 24 },
  backText: { fontSize: 16, color: colors.primary[500], fontWeight: '600' },
  badge: { backgroundColor: colors.neutral[900], alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 12 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.neutral[500], marginBottom: 32, lineHeight: 22 },
  error: { color: colors.red[600], fontSize: 13, fontWeight: '500', marginBottom: 16, textAlign: 'center' },
  btn: { marginTop: 4 },
  forgot: { marginTop: 16, alignItems: 'center' },
  forgotText: { color: colors.primary[500], fontSize: 14, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: colors.neutral[200] },
  orText: { marginHorizontal: 12, fontSize: 13, color: colors.neutral[500] },
  registerHint: { textAlign: 'center', fontSize: 13, color: colors.neutral[500], lineHeight: 20 },
});
