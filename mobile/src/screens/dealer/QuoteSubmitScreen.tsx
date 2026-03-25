import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  KeyboardAvoidingView, Platform, Alert, TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DealerInquiriesStackParamList } from '../../navigation/types';
import { Button, Input, Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import api from '../../services/api';

type Props = NativeStackScreenProps<DealerInquiriesStackParamList, 'QuoteSubmit'>;

export default function QuoteSubmitScreen({ navigation, route }: Props) {
  const { inquiryId, inquiryNumber } = route.params;
  const [inquiry, setInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Quote form
  const [quotedPrice, setQuotedPrice] = useState('');
  const [shippingCost, setShippingCost] = useState('0');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [warrantyInfo, setWarrantyInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInquiry();
  }, []);

  async function fetchInquiry() {
    try {
      const res = await api.get(`/dealer-inquiry/${inquiryId}`);
      setInquiry(res.data?.inquiry || res.data);
    } catch (err: any) {
      Alert.alert('Error', 'Could not load inquiry details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!quotedPrice || isNaN(parseFloat(quotedPrice)) || parseFloat(quotedPrice) <= 0) {
      errs.quotedPrice = 'Enter a valid price (per unit)';
    }
    if (deliveryDays && (isNaN(parseInt(deliveryDays)) || parseInt(deliveryDays) < 1)) {
      errs.deliveryDays = 'Enter valid delivery days';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post(`/dealer-inquiry/${inquiryId}/quote`, {
        quotedPrice: parseFloat(quotedPrice),
        shippingCost: parseFloat(shippingCost) || 0,
        deliveryDays: deliveryDays ? parseInt(deliveryDays) : undefined,
        warrantyInfo: warrantyInfo.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Failed', err.message || 'Could not submit quote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading fullScreen message="Loading inquiry..." />;

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Quote Submitted!</Text>
          <Text style={styles.successText}>
            Your quote for #{inquiryNumber} has been sent.{'\n'}
            The buyer will be notified.
          </Text>
          <Button title="Back to Inquiries" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const totalAmount = (parseFloat(quotedPrice) || 0) * (inquiry?.quantity || 1) + (parseFloat(shippingCost) || 0);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Submit Quote</Text>
          <Text style={styles.inqNum}>Inquiry #{inquiryNumber}</Text>

          {/* Inquiry summary */}
          {inquiry && (
            <Card variant="flat" padding={16} style={styles.summary}>
              {inquiry.modelNumber && (
                <Text style={styles.summaryText}>Product: <Text style={styles.summaryBold}>{inquiry.modelNumber}</Text></Text>
              )}
              <Text style={styles.summaryText}>Quantity: <Text style={styles.summaryBold}>{inquiry.quantity}</Text></Text>
              <Text style={styles.summaryText}>Delivery City: <Text style={styles.summaryBold}>{inquiry.deliveryCity}</Text></Text>
              {inquiry.notes && <Text style={styles.summaryText}>Buyer Notes: {inquiry.notes}</Text>}
            </Card>
          )}

          <Input
            label="Price per Unit (₹) *"
            value={quotedPrice}
            onChangeText={v => { setQuotedPrice(v); setErrors({ ...errors, quotedPrice: '' }); }}
            keyboardType="decimal-pad"
            placeholder="e.g. 1250"
            error={errors.quotedPrice}
          />
          <Input
            label="Shipping Cost (₹)"
            value={shippingCost}
            onChangeText={setShippingCost}
            keyboardType="decimal-pad"
            placeholder="0 for free delivery"
          />
          <Input
            label="Delivery Days"
            value={deliveryDays}
            onChangeText={v => { setDeliveryDays(v); setErrors({ ...errors, deliveryDays: '' }); }}
            keyboardType="number-pad"
            placeholder="e.g. 3"
            error={errors.deliveryDays}
          />
          <Input
            label="Warranty (optional)"
            value={warrantyInfo}
            onChangeText={setWarrantyInfo}
            placeholder="e.g. 2 years manufacturer warranty"
          />
          <Input
            label="Notes for Buyer (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            multiline
            numberOfLines={3}
          />

          {/* Total preview */}
          {quotedPrice && parseFloat(quotedPrice) > 0 && (
            <Card style={styles.totalCard} variant="flat" padding={16}>
              <Text style={styles.totalLabel}>TOTAL QUOTE</Text>
              <Text style={styles.totalAmount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.totalBreakdown}>
                {inquiry?.quantity} × ₹{parseFloat(quotedPrice).toLocaleString('en-IN')}
                {parseFloat(shippingCost) > 0 ? ` + ₹${parseFloat(shippingCost)} shipping` : ' (free delivery)'}
              </Text>
            </Card>
          )}

          <Button
            title="Submit Quote"
            onPress={handleSubmit}
            loading={submitting}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scroll: { padding: 24, flexGrow: 1 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: colors.primary[500], fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', color: colors.neutral[900], marginBottom: 4 },
  inqNum: { fontSize: 14, color: colors.neutral[500], marginBottom: 16, fontWeight: '600' },
  summary: { marginBottom: 20, backgroundColor: colors.neutral[50] },
  summaryText: { fontSize: 13, color: colors.neutral[600], marginBottom: 4 },
  summaryBold: { fontWeight: '700', color: colors.neutral[800] },
  totalCard: { backgroundColor: colors.success[50], marginBottom: 16 },
  totalLabel: { fontSize: 11, fontWeight: '700', color: colors.success[700], letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' },
  totalAmount: { fontSize: 28, fontWeight: '900', color: colors.neutral[900] },
  totalBreakdown: { fontSize: 12, color: colors.neutral[500], marginTop: 4 },
  submitBtn: { marginTop: 4 },
  successContainer: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  successText: { fontSize: 15, color: colors.neutral[500], textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
