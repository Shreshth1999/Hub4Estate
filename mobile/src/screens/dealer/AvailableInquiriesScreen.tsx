import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DealerInquiriesStackParamList } from '../../navigation/types';
import { Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import api from '../../services/api';

type Props = NativeStackScreenProps<DealerInquiriesStackParamList, 'AvailableInquiries'>;

interface Inquiry {
  id: string;
  inquiryNumber: string;
  modelNumber?: string;
  quantity: number;
  deliveryCity: string;
  status: string;
  createdAt: string;
  productPhoto?: string;
  dealerResponse?: { status: string };
}

export default function AvailableInquiriesScreen({ navigation }: Props) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      const res = await api.get('/dealer-inquiry/available');
      setInquiries(res.data?.inquiries || []);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchInquiries();
    setRefreshing(false);
  }

  if (loading) return <Loading fullScreen message="Loading inquiries..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Inquiries</Text>
        <Text style={styles.subtitle}>{inquiries.length} inquiries waiting for quotes</Text>
      </View>

      <FlatList
        data={inquiries}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const hasResponded = item.dealerResponse?.status === 'quoted';
          return (
            <TouchableOpacity
              onPress={() => navigation.navigate('QuoteSubmit', {
                inquiryId: item.id,
                inquiryNumber: item.inquiryNumber,
              })}
              activeOpacity={0.8}
            >
              <Card variant="bordered" padding={16} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.inquiryNum}>#{item.inquiryNumber}</Text>
                  {hasResponded && (
                    <View style={styles.quotedBadge}>
                      <Text style={styles.quotedText}>QUOTED</Text>
                    </View>
                  )}
                </View>

                {item.modelNumber && (
                  <Text style={styles.model}>{item.modelNumber}</Text>
                )}

                <View style={styles.meta}>
                  <Text style={styles.metaItem}>📍 {item.deliveryCity}</Text>
                  <Text style={styles.metaItem}>🔢 Qty: {item.quantity}</Text>
                  <Text style={styles.metaItem}>
                    🕒 {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </Text>
                </View>

                {!hasResponded && (
                  <View style={styles.ctaRow}>
                    <Text style={styles.ctaText}>Tap to submit a quote →</Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Card variant="flat" padding={40}>
            <Text style={styles.emptyTitle}>No inquiries available</Text>
            <Text style={styles.emptySub}>
              New inquiries from buyers in your service area will appear here.
            </Text>
          </Card>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  title: { fontSize: 22, fontWeight: '900', color: colors.neutral[900] },
  subtitle: { fontSize: 13, color: colors.neutral[500], marginTop: 4 },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  inquiryNum: { fontSize: 16, fontWeight: '800', color: colors.neutral[900] },
  quotedBadge: { backgroundColor: colors.success[500], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  quotedText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  model: { fontSize: 14, color: colors.neutral[700], fontWeight: '600', marginBottom: 10 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaItem: { fontSize: 12, color: colors.neutral[500], backgroundColor: colors.neutral[100], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ctaRow: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: 8 },
  ctaText: { fontSize: 13, color: colors.primary[500], fontWeight: '700' },
  emptyTitle: { textAlign: 'center', fontSize: 16, fontWeight: '800', color: colors.neutral[700], marginBottom: 8 },
  emptySub: { textAlign: 'center', fontSize: 13, color: colors.neutral[500], lineHeight: 20 },
});
