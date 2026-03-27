import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getMyRooms } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, isLoggedIn } = useAuth();

  const fetchRooms = async () => {
    try {
      const data = await getMyRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) { router.replace('/'); return; }
      fetchRooms();
    }, [isLoggedIn])
  );

  const onRefresh = () => { setRefreshing(true); fetchRooms(); };

  const renderRoom = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.7}
      onPress={() => router.push(`/room/${item.id}`)}
    >
      <View style={s.cardHeader}>
        <View style={s.iconWrap}>
          <Ionicons name="videocam" size={24} color={Colors.accent.cyan} />
        </View>
        <View style={s.dateBadge}>
          <View style={s.dot} />
          <Text style={s.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={s.cardTitle}>{item.name}</Text>
      <Text style={s.cardDesc}>AES-GCM 256-bit Encrypted Chamber</Text>
      <View style={s.cardFooter}>
        <View style={s.enterBtn}>
          <Text style={s.enterText}>ENTER</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.accent.emerald} />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.accent.emerald} />
        <Text style={s.loadingText}>SYNCHRONIZING...</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.welcome}>
          Welcome, <Text style={{ color: Colors.accent.emerald }}>{user?.full_name?.split(' ')[0] || user?.username || 'Ghost'}</Text>
        </Text>
        <Text style={s.sub}>Your private workspace is secured and ready.</Text>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.emerald} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="desktop-outline" size={48} color={Colors.slate[700]} />
            <Text style={s.emptyTitle}>No Active Chambers</Text>
            <Text style={s.emptyDesc}>Create your first private room to get started.</Text>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950] },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  welcome: { fontSize: 28, fontWeight: '900', color: Colors.white, fontStyle: 'italic' },
  sub: { fontSize: 12, color: Colors.slate[500], fontWeight: '600', marginTop: 4 },
  list: { padding: 20, gap: 16 },
  card: {
    backgroundColor: Colors.ghost[900], borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconWrap: {
    width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  dateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.ghost[950], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent.emerald },
  dateText: { fontSize: 10, fontWeight: '800', color: Colors.slate[400], letterSpacing: 1 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: Colors.white, fontStyle: 'italic', marginBottom: 4 },
  cardDesc: { fontSize: 11, fontWeight: '700', color: Colors.slate[500], letterSpacing: 0.5 },
  cardFooter: { marginTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  enterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  enterText: { fontSize: 10, fontWeight: '900', color: Colors.accent.emerald, letterSpacing: 3 },
  loadingText: { fontSize: 10, fontWeight: '800', color: Colors.slate[700], letterSpacing: 4, marginTop: 16 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: Colors.white, marginTop: 16, fontStyle: 'italic' },
  emptyDesc: { fontSize: 13, color: Colors.slate[500], marginTop: 8 },
});
