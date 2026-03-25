import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserHomeStackParamList } from '../../navigation/types';
import { Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<UserHomeStackParamList, 'Home'>;

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.categories || []);
    } catch {
      // Show empty state
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  }

  if (loading) return <Loading fullScreen message="Loading..." />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {user ? `Hello, ${user.name.split(' ')[0]}` : 'Hub4Estate'}
            </Text>
            <Text style={styles.subGreeting}>Find the best price for any electrical product</Text>
          </View>
        </View>

        {/* Quick Inquiry CTA */}
        <Card style={styles.cta} padding={20}>
          <Text style={styles.ctaTitle}>Need an electrical product?</Text>
          <Text style={styles.ctaText}>
            Scan the label or enter the model number — we'll get you quotes from verified dealers.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => (navigation as any).navigate('InquiryTab')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>📷  Scan & Get Quotes</Text>
          </TouchableOpacity>
        </Card>

        {/* Track Inquiry */}
        <TouchableOpacity
          style={styles.trackBanner}
          onPress={() => (navigation as any).navigate('InquiryTab', { screen: 'TrackInquiry', params: {} })}
          activeOpacity={0.85}
        >
          <Text style={styles.trackText}>🔍  Track an existing inquiry</Text>
        </TouchableOpacity>

        {/* Product Categories */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>

        {categories.length === 0 ? (
          <Card variant="flat">
            <Text style={styles.emptyText}>No categories available yet.</Text>
          </Card>
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => navigation.navigate('Categories')}
                activeOpacity={0.8}
              >
                <Text style={styles.catIcon}>{cat.icon || '⚡'}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { value: '10+', label: 'Brands' },
            { value: '50+', label: 'Dealers' },
            { value: '₹24K', label: 'Avg Savings' },
          ].map((s, i) => (
            <View key={i} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { padding: 24, paddingBottom: 16 },
  greeting: { fontSize: 22, fontWeight: '900', color: colors.neutral[900] },
  subGreeting: { fontSize: 13, color: colors.neutral[500], marginTop: 4 },
  cta: { marginHorizontal: 16, backgroundColor: colors.neutral[900] },
  ctaTitle: { fontSize: 18, fontWeight: '900', color: colors.white, marginBottom: 8 },
  ctaText: { fontSize: 13, color: colors.neutral[400], marginBottom: 16, lineHeight: 20 },
  ctaBtn: {
    backgroundColor: colors.primary[500], borderRadius: 8,
    paddingVertical: 12, alignItems: 'center',
  },
  ctaBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  trackBanner: {
    marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 8,
    borderWidth: 2, borderColor: colors.neutral[200], backgroundColor: colors.white,
    alignItems: 'center',
  },
  trackText: { fontSize: 14, fontWeight: '600', color: colors.neutral[600] },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.neutral[900], marginHorizontal: 16, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  catCard: {
    width: '46%', margin: '2%', backgroundColor: colors.white, borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 2, borderColor: colors.neutral[200],
  },
  catIcon: { fontSize: 28, marginBottom: 8 },
  catName: { fontSize: 13, fontWeight: '700', color: colors.neutral[800], textAlign: 'center' },
  emptyText: { textAlign: 'center', color: colors.neutral[500], fontSize: 14, padding: 24 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 16, marginBottom: 8, padding: 20,
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 2, borderColor: colors.neutral[200],
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.primary[500] },
  statLabel: { fontSize: 11, color: colors.neutral[500], marginTop: 2, fontWeight: '600' },
});
