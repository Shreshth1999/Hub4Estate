import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { UserHomeStackParamList } from '../../navigation/types';
import { Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import api from '../../services/api';

type Props = NativeStackScreenProps<UserHomeStackParamList, 'Categories'>;

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  whatIsIt: string;
  subCategories: { id: string; name: string }[];
}

export default function CategoriesScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/products/categories')
      .then(res => {
        const cats = res.data.categories || [];
        setCategories(cats);
        setFiltered(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(categories);
    } else {
      const q = search.toLowerCase();
      setFiltered(categories.filter(c => c.name.toLowerCase().includes(q)));
    }
  }, [search, categories]);

  if (loading) return <Loading fullScreen message="Loading..." />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Categories</Text>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search categories..."
          placeholderTextColor={colors.neutral[400]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card variant="bordered" padding={16} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.icon}>{item.icon || '⚡'}</Text>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                )}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No categories found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { padding: 16, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.neutral[200] },
  back: { fontSize: 16, color: colors.primary[500], fontWeight: '600', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: colors.neutral[900], marginBottom: 12 },
  search: {
    borderWidth: 2, borderColor: colors.neutral[200], borderRadius: 8,
    padding: 10, fontSize: 14, color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 28, marginRight: 12, marginTop: 2 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: colors.neutral[900], marginBottom: 4 },
  desc: { fontSize: 13, color: colors.neutral[500], lineHeight: 18 },
  empty: { textAlign: 'center', color: colors.neutral[500], padding: 40, fontSize: 14 },
});
