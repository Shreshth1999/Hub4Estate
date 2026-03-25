import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function DealerDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await api.get('/dealer/insights');
      setStats(res.data);
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Log Out', 'Log out from all devices?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          logout();
        },
      },
    ]);
  }

  const statusColor: Record<string, string> = {
    VERIFIED: colors.success[600],
    PENDING_VERIFICATION: colors.primary[500],
    UNDER_REVIEW: colors.blue[500],
    DOCUMENTS_PENDING: colors.primary[500],
    REJECTED: colors.red[600],
    SUSPENDED: colors.red[600],
  };

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dealer Portal</Text>
            <Text style={styles.bizName}>{user?.name || 'Your Business'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor[user?.status || 'PENDING_VERIFICATION'] }]}>
            <Text style={styles.statusText}>{(user?.status || '').replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Status Alert */}
        {user?.status !== 'VERIFIED' && (
          <Card style={styles.alertCard} padding={16}>
            <Text style={styles.alertTitle}>
              {user?.status === 'PENDING_VERIFICATION' ? '⏳ Verification Pending' : '📋 Action Required'}
            </Text>
            <Text style={styles.alertText}>
              {user?.status === 'PENDING_VERIFICATION'
                ? 'Your account is under review. We\'ll notify you once verified (usually within 24 hours).'
                : 'Please complete your onboarding to start receiving inquiries.'}
            </Text>
          </Card>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.statsGrid}>
          {[
            { label: 'RFQs Received', value: stats?.totalRFQsReceived ?? '-', icon: '📥' },
            { label: 'Quotes Submitted', value: stats?.totalQuotesSubmitted ?? '-', icon: '📤' },
            { label: 'Conversions', value: stats?.totalConversions ?? '-', icon: '✅' },
            { label: 'Conversion Rate', value: stats?.conversionRate ? `${stats.conversionRate.toFixed(0)}%` : '-', icon: '📈' },
          ].map((s, i) => (
            <Card key={i} variant="bordered" padding={16} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => (navigation as any).navigate('InquiriesTab')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Available Inquiries</Text>
            <Text style={styles.actionSub}>Browse and quote on new buyer inquiries</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        {/* Account menu */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="bordered" padding={0}>
          {[
            { label: 'Business Profile', icon: '🏪' },
            { label: 'Brand Authorizations', icon: '✅' },
            { label: 'Notifications', icon: '🔔' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i > 0 && styles.menuBorder]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greeting: { fontSize: 12, fontWeight: '700', color: colors.neutral[500], letterSpacing: 2, textTransform: 'uppercase' },
  bizName: { fontSize: 20, fontWeight: '900', color: colors.neutral[900], marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  statusText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  alertCard: { backgroundColor: '#FFF7ED', borderWidth: 2, borderColor: colors.primary[100] ?? '#FFEDD5', marginBottom: 16 },
  alertTitle: { fontSize: 15, fontWeight: '800', color: colors.primary[600], marginBottom: 6 },
  alertText: { fontSize: 13, color: colors.primary[600] ?? '#EA580C', lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.neutral[600], letterSpacing: 1, marginBottom: 10, marginTop: 8, textTransform: 'uppercase' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statCard: { width: '47%', marginBottom: 0 },
  statIcon: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.neutral[900] },
  statLabel: { fontSize: 11, color: colors.neutral[500], marginTop: 2, fontWeight: '600' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 12, padding: 16, borderWidth: 2, borderColor: colors.neutral[200], marginBottom: 16,
  },
  actionIcon: { fontSize: 24, marginRight: 12 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
  actionSub: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  actionArrow: { fontSize: 20, color: colors.neutral[400] },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuBorder: { borderTopWidth: 1, borderTopColor: colors.neutral[100] },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: colors.neutral[800], fontWeight: '600' },
  menuArrow: { fontSize: 18, color: colors.neutral[400] },
  logoutBtn: { marginTop: 16, padding: 16, alignItems: 'center', borderRadius: 8, borderWidth: 2, borderColor: colors.red[200] ?? '#FECACA' },
  logoutText: { color: colors.red[600], fontWeight: '700', fontSize: 15 },
});
