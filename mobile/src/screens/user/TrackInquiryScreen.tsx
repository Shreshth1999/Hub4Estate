import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserInquiryStackParamList } from '../../navigation/types';
import { Button, Input, Card } from '../../components';
import { colors } from '../../theme/colors';
import { inquiryService } from '../../services/inquiry';

type Props = NativeStackScreenProps<UserInquiryStackParamList, 'TrackInquiry'>;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Under Review', color: colors.blue[500] },
  contacted: { label: 'Contacted', color: colors.primary[500] },
  quoted: { label: 'Quote Ready', color: colors.success[500] },
  closed: { label: 'Closed', color: colors.neutral[500] },
};

export default function TrackInquiryScreen({ route }: Props) {
  const [phone, setPhone] = useState(route.params?.phone || '');
  const [inquiryNumber, setInquiryNumber] = useState(route.params?.inquiryNumber || '');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-search if params provided
  useEffect(() => {
    if (route.params?.inquiryNumber && route.params?.phone) {
      handleTrack();
    }
  }, []);

  async function handleTrack() {
    if (!phone.trim()) { setError('Enter your mobile number'); return; }
    if (!inquiryNumber.trim()) { setError('Enter your inquiry number'); return; }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await inquiryService.trackInquiry(phone.trim(), inquiryNumber.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Inquiry not found. Check your phone number and inquiry number.');
    } finally {
      setLoading(false);
    }
  }

  const statusInfo = result ? (STATUS_LABELS[result.status] || { label: result.status, color: colors.neutral[500] }) : null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Track Inquiry</Text>
          <Text style={styles.subtitle}>Enter your details to see the status of your inquiry.</Text>

          <Input
            label="Mobile Number"
            value={phone}
            onChangeText={v => { setPhone(v); setError(''); }}
            keyboardType="phone-pad"
            placeholder="9876543210"
            maxLength={10}
          />
          <Input
            label="Inquiry Number"
            value={inquiryNumber}
            onChangeText={v => { setInquiryNumber(v.toUpperCase()); setError(''); }}
            placeholder="HUB-XXXX-0001"
            autoCapitalize="characters"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Track" onPress={handleTrack} loading={loading} />

          {result && statusInfo && (
            <Card style={styles.result} variant="bordered" padding={20}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultNumber}>#{result.inquiryNumber}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Text style={styles.statusText}>{statusInfo.label}</Text>
                </View>
              </View>

              {result.modelNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Product</Text>
                  <Text style={styles.detailValue}>{result.modelNumber}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>City</Text>
                <Text style={styles.detailValue}>{result.deliveryCity}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{result.quantity}</Text>
              </View>

              {result.status === 'quoted' && result.quotedPrice && (
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteTitle}>Your Quote</Text>
                  <Text style={styles.quotePrice}>₹{result.quotedPrice?.toLocaleString('en-IN')}</Text>
                  {result.shippingCost > 0 && (
                    <Text style={styles.quoteShipping}>+ ₹{result.shippingCost} shipping</Text>
                  )}
                  {result.estimatedDelivery && (
                    <Text style={styles.quoteDelivery}>Delivery: {result.estimatedDelivery}</Text>
                  )}
                  {result.responseNotes && (
                    <Text style={styles.quoteNotes}>{result.responseNotes}</Text>
                  )}
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted</Text>
                <Text style={styles.detailValue}>
                  {new Date(result.createdAt).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.neutral[500], marginBottom: 24, lineHeight: 20 },
  error: { color: colors.red[600], fontSize: 13, marginBottom: 16, textAlign: 'center' },
  result: { marginTop: 24 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultNumber: { fontSize: 18, fontWeight: '800', color: colors.neutral[900] },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  detailLabel: { fontSize: 13, color: colors.neutral[500], fontWeight: '600' },
  detailValue: { fontSize: 13, color: colors.neutral[800], fontWeight: '600', flex: 1, textAlign: 'right' },
  quoteBox: { backgroundColor: colors.success[50], borderRadius: 8, padding: 16, marginVertical: 12 },
  quoteTitle: { fontSize: 12, fontWeight: '700', color: colors.success[700], letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  quotePrice: { fontSize: 28, fontWeight: '900', color: colors.neutral[900] },
  quoteShipping: { fontSize: 13, color: colors.neutral[500], marginTop: 4 },
  quoteDelivery: { fontSize: 13, color: colors.success[700], marginTop: 4, fontWeight: '600' },
  quoteNotes: { fontSize: 13, color: colors.neutral[600], marginTop: 8, lineHeight: 18 },
});
