import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { joinRoom, lookupInvite } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function JoinRoomTab() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const trimmed = input.trim();
    if (!trimmed) return Alert.alert('Error', 'Paste an invite link or Room ID');
    setLoading(true);
    try {
      // Smart parsing
      if (trimmed.includes('/join/')) {
        const token = trimmed.split('/join/').pop() || '';
        const lookup = await lookupInvite(token);
        await joinRoom(lookup.roomId, lookup.accessToken);
        router.push(`/room/${lookup.roomId}`);
      } else {
        await joinRoom(trimmed);
        router.push(`/room/${trimmed}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.inner}>
        <View style={s.iconWrap}>
          <Ionicons name="link" size={36} color={Colors.accent.cyan} />
        </View>
        <Text style={s.title}>Join Chamber</Text>
        <Text style={s.sub}>Paste an invite link or Room ID to enter.</Text>

        <View style={s.card}>
          <Text style={s.label}>INVITE LINK / ROOM ID</Text>
          <TextInput
            style={s.input}
            placeholder="https://ghostroom.app/join/..."
            placeholderTextColor={Colors.slate[700]}
            value={input}
            onChangeText={setInput}
            autoCapitalize="none"
          />
          <TouchableOpacity style={s.btn} onPress={handleJoin} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={Colors.ghost[950]} /> : (
              <Text style={s.btnText}>ENTER GHOSTROOM</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950] },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  iconWrap: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.accent.cyan + '15',
    borderWidth: 1, borderColor: Colors.accent.cyan + '30',
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '900', color: Colors.white, textAlign: 'center', fontStyle: 'italic' },
  sub: { fontSize: 12, color: Colors.slate[500], textAlign: 'center', fontWeight: '600', marginTop: 4, marginBottom: 32 },
  card: {
    backgroundColor: Colors.ghost[900], borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  label: { fontSize: 10, fontWeight: '800', color: Colors.slate[600], letterSpacing: 3, marginBottom: 12 },
  input: {
    backgroundColor: Colors.ghost[950], borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16,
    color: Colors.white, fontSize: 13, fontWeight: '600', marginBottom: 16,
  },
  btn: {
    backgroundColor: Colors.accent.emerald, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: { color: Colors.ghost[950], fontWeight: '900', fontSize: 13, letterSpacing: 2 },
});
