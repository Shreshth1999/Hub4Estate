import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { Card, Loading, Button } from '../../components';
import { colors } from '../../theme/colors';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function UserDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, []);

  async function fetchInquiries() {
    try {
      const res = await api.get('/inquiry/my-inquiries');
      setRecentInquiries((res.data?.inquiries || []).slice(0, 5));
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
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

  if (loading) return <Loading fullScreen />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <Text style={styles.contact}>{user?.phone || user?.email || ''}</Text>
            {user?.city && <Text style={styles.city}>📍 {user.city}</Text>}
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => (navigation as any).navigate('InquiryTab')}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>New Inquiry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => (navigation as any).navigate('InquiryTab', { screen: 'TrackInquiry', params: {} })}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Track Inquiry</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Inquiries */}
        <Text style={styles.sectionTitle}>Recent Inquiries</Text>
        {recentInquiries.length === 0 ? (
          <Card variant="flat" padding={24}>
            <Text style={styles.emptyText}>No inquiries yet.</Text>
            <Text style={styles.emptySubText}>Submit your first inquiry to get dealer quotes.</Text>
          </Card>
        ) : (
          recentInquiries.map((inq: any) => (
            <Card key={inq.id} variant="bordered" padding={16} style={styles.inquiryCard}>
              <View style={styles.inquiryRow}>
                <Text style={styles.inquiryNum}>#{inq.inquiryNumber}</Text>
                <View style={[styles.badge, { backgroundColor: inq.status === 'quoted' ? colors.success[500] : colors.blue[500] }]}>
                  <Text style={styles.badgeText}>{inq.status?.toUpperCase()}</Text>
                </View>
              </View>
              {inq.modelNumber && <Text style={styles.inquiryModel}>{inq.modelNumber}</Text>}
              <Text style={styles.inquiryCity}>📍 {inq.deliveryCity}</Text>
            </Card>
          ))
        )}

        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="bordered" padding={0}>
          {[
            { label: 'My Profile', icon: '👤' },
            { label: 'Notifications', icon: '🔔' },
            { label: 'Help & Support', icon: '❓' },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={[styles.menuItem, i > 0 && styles.menuItemBorder]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Button
          title="Log Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.logout}
          textStyle={{ color: colors.red[600] }}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { padding: 16 },
  profileCard: {
    flexDirection: 'row', backgroundColor: colors.neutral[900],
    borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center',
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary[500],
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: colors.white },
  profileInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '800', color: colors.white },
  contact: { fontSize: 13, color: colors.neutral[400], marginTop: 2 },
  city: { fontSize: 13, color: colors.neutral[400], marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.neutral[700], letterSpacing: 1, marginBottom: 10, marginTop: 16, textTransform: 'uppercase' },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 2, borderColor: colors.neutral[200],
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionText: { fontSize: 12, fontWeight: '700', color: colors.neutral[700] },
  emptyText: { textAlign: 'center', fontWeight: '700', color: colors.neutral[600], fontSize: 15 },
  emptySubText: { textAlign: 'center', color: colors.neutral[400], fontSize: 13, marginTop: 4 },
  inquiryCard: { marginBottom: 8 },
  inquiryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  inquiryNum: { fontSize: 15, fontWeight: '800', color: colors.neutral[900] },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  inquiryModel: { fontSize: 13, color: colors.neutral[600], marginBottom: 4 },
  inquiryCity: { fontSize: 12, color: colors.neutral[500] },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderTopWidth: 1, borderTopColor: colors.neutral[100] },
  menuIcon: { fontSize: 18, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: colors.neutral[800], fontWeight: '600' },
  menuArrow: { fontSize: 18, color: colors.neutral[400] },
  logout: { marginTop: 16, borderColor: colors.red[600] },
});
