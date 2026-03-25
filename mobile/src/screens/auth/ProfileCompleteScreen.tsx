import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button, Input } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileComplete'>;

const ROLES = [
  { value: 'INDIVIDUAL_HOME_BUILDER', label: 'Home Builder' },
  { value: 'RENOVATION_HOMEOWNER', label: 'Homeowner (Renovation)' },
  { value: 'ARCHITECT', label: 'Architect' },
  { value: 'INTERIOR_DESIGNER', label: 'Interior Designer' },
  { value: 'CONTRACTOR', label: 'Contractor' },
  { value: 'ELECTRICIAN', label: 'Electrician' },
  { value: 'SMALL_BUILDER', label: 'Small Builder' },
  { value: 'DEVELOPER', label: 'Developer' },
];

export default function ProfileCompleteScreen({ navigation, route }: Props) {
  const { identifier, identifierType } = route.params;
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setAuth } = useAuthStore();

  async function handleSubmit() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!city.trim()) errs.city = 'City is required';
    if (!selectedRole) errs.role = 'Please select your role';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      // Create account
      const signupResult = await authService.signupUser({
        name: name.trim(),
        [identifierType]: identifier,
        city: city.trim(),
      });

      // Complete profile (role)
      const profileResult = await authService.completeProfile({
        role: selectedRole,
        city: city.trim(),
      });

      setAuth(profileResult.user, profileResult.token);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to create account' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Almost there!</Text>
          <Text style={styles.subtitle}>Tell us a bit about yourself so we can match you with the right dealers.</Text>

          <Input label="Full Name" value={name} onChangeText={v => { setName(v); setErrors({...errors, name: ''}); }} placeholder="Raj Sharma" error={errors.name} />
          <Input label="Your City" value={city} onChangeText={v => { setCity(v); setErrors({...errors, city: ''}); }} placeholder="Mumbai, Delhi, Jaipur..." error={errors.city} />

          <Text style={styles.roleLabel}>I AM A</Text>
          {errors.role && <Text style={styles.fieldError}>{errors.role}</Text>}
          <View style={styles.roleGrid}>
            {ROLES.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleChip, selectedRole === r.value && styles.roleChipActive]}
                onPress={() => setSelectedRole(r.value)}
              >
                <Text style={[styles.roleChipText, selectedRole === r.value && styles.roleChipTextActive]}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {errors.general && <Text style={styles.generalError}>{errors.general}</Text>}

          <Button title="Complete Setup" onPress={handleSubmit} loading={loading} style={styles.cta} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.neutral[500], marginBottom: 28, lineHeight: 22 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: colors.neutral[600], letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  fieldError: { color: colors.red[600], fontSize: 12, marginBottom: 8 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  roleChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 2, borderColor: colors.neutral[200], backgroundColor: colors.neutral[50] },
  roleChipActive: { borderColor: colors.primary[500], backgroundColor: colors.primary[50] },
  roleChipText: { fontSize: 13, fontWeight: '600', color: colors.neutral[600] },
  roleChipTextActive: { color: colors.primary[600] },
  generalError: { color: colors.red[600], fontSize: 13, marginBottom: 16, textAlign: 'center' },
  cta: { marginTop: 8 },
});
