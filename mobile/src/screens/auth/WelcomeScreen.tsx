import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { Button } from '../../components';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>ELECTRICAL SUPPLIES</Text>
        <Text style={styles.title}>HUB4ESTATE</Text>
        <Text style={styles.tagline}>
          Best price. Right dealer.{'\n'}Every time.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '📷', text: 'Scan any product — get prices from 8+ dealers' },
          { icon: '⚡', text: 'Havells, Polycab, Schneider & 50+ brands' },
          { icon: '🚚', text: 'Verified dealers in your city, with delivery' },
        ].map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button title="Get Started — I'm a Buyer" onPress={() => navigation.navigate('Login', { type: 'user' })} />
        <View style={styles.gap} />
        <Button
          title="I'm a Dealer"
          variant="outline"
          onPress={() => navigation.navigate('DealerLogin')}
        />
        <Text style={styles.terms}>
          By continuing, you agree to our Terms & Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    padding: 24,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary[500],
    letterSpacing: 3,
    marginBottom: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 4,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 20,
    color: colors.neutral[300],
    fontWeight: '500',
    lineHeight: 30,
  },
  features: {
    marginVertical: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral[300],
    lineHeight: 22,
  },
  actions: {},
  gap: {
    height: 12,
  },
  terms: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 11,
    color: colors.neutral[500],
  },
});
