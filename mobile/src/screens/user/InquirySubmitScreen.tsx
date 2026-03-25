import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input } from '../../components';
import { colors } from '../../theme/colors';
import { inquiryService } from '../../services/inquiry';

type InquiryForm = {
  name: string;
  phone: string;
  modelNumber: string;
  quantity: string;
  deliveryCity: string;
};

const defaultForm: InquiryForm = {
  name: '', phone: '', modelNumber: '', quantity: '1', deliveryCity: '',
};

export default function InquirySubmitScreen({ navigation }: any) {
  const [form, setForm] = useState<InquiryForm>(defaultForm);
  const [photo, setPhoto] = useState<{ uri: string; type: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [inquiryNumber, setInquiryNumber] = useState('');
  const [errors, setErrors] = useState<Partial<InquiryForm>>({});

  function set(field: keyof InquiryForm, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  }

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload product images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, type: 'image/jpeg', name: 'product.jpg' });
    }
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to scan product labels.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, type: 'image/jpeg', name: 'product.jpg' });
    }
  }

  function validate(): boolean {
    const errs: Partial<InquiryForm> = {};
    if (!form.name.trim()) errs.name = 'Your name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.deliveryCity.trim()) errs.deliveryCity = 'Delivery city is required';
    if (!photo && !form.modelNumber.trim()) {
      errs.modelNumber = 'Enter model number or upload a product photo';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await inquiryService.submitInquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        modelNumber: form.modelNumber.trim() || undefined,
        quantity: parseInt(form.quantity) || 1,
        deliveryCity: form.deliveryCity.trim(),
        productPhoto: photo || undefined,
      });

      setInquiryNumber((result as any).inquiryNumber || (result as any).id || '');
      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Submission Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Inquiry Submitted!</Text>
          <Text style={styles.successNumber}>#{inquiryNumber}</Text>
          <Text style={styles.successText}>
            We'll contact you within a few hours with quotes from verified dealers.
          </Text>
          <Button
            title="Track This Inquiry"
            onPress={() => navigation.navigate('TrackInquiry', { phone: form.phone })}
            style={{ marginBottom: 12 }}
          />
          <Button
            title="Submit Another"
            variant="outline"
            onPress={() => { setSubmitted(false); setForm(defaultForm); setPhoto(null); }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Get a Quote</Text>
          <Text style={styles.subtitle}>Tell us what you need — we'll find you the best price.</Text>

          {/* Photo upload */}
          <Text style={styles.label}>PRODUCT PHOTO (Recommended)</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
              <Text style={styles.photoBtnIcon}>🖼</Text>
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>

          {photo && (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.previewImg} />
              <TouchableOpacity onPress={() => setPhoto(null)} style={styles.removePhoto}>
                <Text style={{ color: colors.red[600], fontWeight: '700' }}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          )}

          <Input
            label="Model Number (optional if photo provided)"
            value={form.modelNumber}
            onChangeText={v => set('modelNumber', v)}
            placeholder="e.g. PXCS21551 or MCB 32A DP"
            error={errors.modelNumber}
          />

          <Input
            label="Your Name *"
            value={form.name}
            onChangeText={v => set('name', v)}
            placeholder="Raj Sharma"
            error={errors.name}
          />
          <Input
            label="Mobile Number *"
            value={form.phone}
            onChangeText={v => set('phone', v)}
            keyboardType="phone-pad"
            placeholder="9876543210"
            maxLength={10}
            error={errors.phone}
          />
          <Input
            label="Delivery City *"
            value={form.deliveryCity}
            onChangeText={v => set('deliveryCity', v)}
            placeholder="Mumbai, Delhi, Jaipur..."
            error={errors.deliveryCity}
          />
          <Input
            label="Quantity"
            value={form.quantity}
            onChangeText={v => set('quantity', v)}
            keyboardType="number-pad"
            placeholder="1"
          />

          <Button title="Submit Inquiry" onPress={handleSubmit} loading={loading} />
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
  label: { fontSize: 11, fontWeight: '700', color: colors.neutral[600], letterSpacing: 1, marginBottom: 8 },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoBtn: {
    flex: 1, borderWidth: 2, borderColor: colors.neutral[200], borderRadius: 8,
    borderStyle: 'dashed', padding: 16, alignItems: 'center', backgroundColor: colors.neutral[50],
  },
  photoBtnIcon: { fontSize: 24, marginBottom: 4 },
  photoBtnText: { fontSize: 12, fontWeight: '600', color: colors.neutral[600] },
  photoPreview: { marginBottom: 16, alignItems: 'center' },
  previewImg: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8 },
  removePhoto: { alignSelf: 'flex-end' },
  successContainer: { flex: 1, padding: 32, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '900', color: colors.neutral[900], marginBottom: 8 },
  successNumber: { fontSize: 18, fontWeight: '700', color: colors.primary[500], marginBottom: 16 },
  successText: { fontSize: 15, color: colors.neutral[500], textAlign: 'center', lineHeight: 22, marginBottom: 32 },
});
