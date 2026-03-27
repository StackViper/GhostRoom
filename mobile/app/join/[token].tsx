import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { lookupInvite, joinRoom } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function JoinByInviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'auth_required' | 'joining' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (!token || authLoading) return;

    if (!isLoggedIn) {
      AsyncStorage.setItem('pending_invite', token);
      setStatus('auth_required');
      return;
    }

    const autoJoin = async () => {
      try {
        setStatus('loading');
        const lookup = await lookupInvite(token);
        setRoomName(lookup.roomName);
        setStatus('joining');
        await joinRoom(lookup.roomId, lookup.accessToken);
        await AsyncStorage.removeItem('pending_invite');
        router.replace(`/room/${lookup.roomId}`);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.error || 'Invalid or expired invite link.');
        setStatus('error');
      }
    };

    autoJoin();
  }, [token, isLoggedIn, authLoading]);

  return (
    <View style={s.container}>
      <View style={s.card}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={Colors.accent.emerald} />
            <Text style={s.title}>Validating Invite</Text>
            <Text style={s.sub}>Decrypting access credentials...</Text>
          </>
        )}
        {status === 'joining' && (
          <>
            <View style={s.icon}><Ionicons name="shield-checkmark" size={36} color={Colors.accent.emerald} /></View>
            <Text style={s.title}>Entering Chamber</Text>
            <Text style={[s.sub, { color: Colors.accent.emerald }]}>{roomName}</Text>
          </>
        )}
        {status === 'auth_required' && (
          <>
            <View style={[s.icon, { backgroundColor: Colors.accent.cyan + '15', borderColor: Colors.accent.cyan + '30' }]}>
              <Ionicons name="person-circle" size={36} color={Colors.accent.cyan} />
            </View>
            <Text style={s.title}>Authentication Required</Text>
            <Text style={s.sub}>Log in to join this room. Your invite will be saved.</Text>
            <TouchableOpacity style={s.btn} onPress={() => router.replace('/')} activeOpacity={0.8}>
              <Text style={s.btnText}>LOG IN</Text>
            </TouchableOpacity>
          </>
        )}
        {status === 'error' && (
          <>
            <View style={[s.icon, { backgroundColor: Colors.accent.rose + '15', borderColor: Colors.accent.rose + '30' }]}>
              <Ionicons name="alert-circle" size={36} color={Colors.accent.rose} />
            </View>
            <Text style={s.title}>Access Denied</Text>
            <Text style={s.sub}>{errorMsg}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: 'rgba(255,255,255,0.05)' }]} onPress={() => router.replace('/(tabs)/dashboard')} activeOpacity={0.8}>
              <Text style={[s.btnText, { color: Colors.white }]}>GO TO DASHBOARD</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950], justifyContent: 'center', paddingHorizontal: 24 },
  card: {
    backgroundColor: Colors.ghost[900], borderRadius: 24, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  icon: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.accent.emerald + '15',
    borderWidth: 1, borderColor: Colors.accent.emerald + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: '900', color: Colors.white, fontStyle: 'italic', marginTop: 16, textAlign: 'center' },
  sub: { fontSize: 12, color: Colors.slate[500], fontWeight: '600', marginTop: 8, textAlign: 'center' },
  btn: {
    backgroundColor: Colors.accent.emerald, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32,
    alignItems: 'center', marginTop: 24,
  },
  btnText: { color: Colors.ghost[950], fontWeight: '900', fontSize: 12, letterSpacing: 2 },
});
