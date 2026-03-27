import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../services/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={s.container}>
      <View style={s.inner}>
        {/* Avatar */}
        <View style={s.avatarWrap}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={s.avatarImg} />
          ) : (
            <Text style={s.avatarText}>{user?.username?.charAt(0)?.toUpperCase() || 'G'}</Text>
          )}
        </View>

        <Text style={s.name}>{user?.full_name || user?.username || 'Ghost Operator'}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <Text style={s.badge}>CLEARANCE: ACTIVE</Text>

        {/* Info Cards */}
        <View style={s.card}>
          <InfoRow icon="person" label="Alias" value={user?.username || '—'} />
          <InfoRow icon="mail" label="Neural Address" value={user?.email || '—'} />
          <InfoRow icon="shield-checkmark" label="Security" value="AES-256 E2EE" />
          <InfoRow icon="server" label="Architecture" value="Microservices" last />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out" size={20} color={Colors.accent.rose} />
          <Text style={s.logoutText}>DISCONNECT SESSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, last }: any) {
  return (
    <View style={[s.row, !last && s.rowBorder]}>
      <View style={s.rowLeft}>
        <Ionicons name={icon} size={16} color={Colors.accent.emerald} />
        <Text style={s.rowLabel}>{label}</Text>
      </View>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950] },
  inner: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
  avatarWrap: {
    width: 96, height: 96, borderRadius: 32, backgroundColor: Colors.ghost[800],
    borderWidth: 2, borderColor: Colors.accent.emerald + '40',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 36, fontWeight: '900', color: Colors.accent.emerald },
  name: { fontSize: 24, fontWeight: '900', color: Colors.white, fontStyle: 'italic' },
  email: { fontSize: 12, color: Colors.slate[500], fontWeight: '600', marginTop: 4 },
  badge: {
    fontSize: 9, fontWeight: '800', color: Colors.accent.emerald, letterSpacing: 4,
    marginTop: 12, backgroundColor: Colors.accent.emerald + '15',
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.accent.emerald + '30', overflow: 'hidden',
  },
  card: {
    backgroundColor: Colors.ghost[900], borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginTop: 32, width: '100%',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowLabel: { fontSize: 12, fontWeight: '700', color: Colors.slate[400] },
  rowValue: { fontSize: 12, fontWeight: '800', color: Colors.white },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 32, paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: Colors.accent.rose + '10', borderRadius: 16,
    borderWidth: 1, borderColor: Colors.accent.rose + '20',
  },
  logoutText: { fontSize: 11, fontWeight: '900', color: Colors.accent.rose, letterSpacing: 2 },
});
