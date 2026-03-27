import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { createRoom } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function CreateRoomScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Room name is required');
    setLoading(true);
    try {
      const room = await createRoom(name.trim());
      router.replace(`/room/${room.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.inner}>
        <View style={s.iconWrap}>
          <Ionicons name="add-circle" size={40} color={Colors.accent.emerald} />
        </View>
        <Text style={s.title}>Initialize Chamber</Text>
        <Text style={s.sub}>Create a new encrypted meeting room.</Text>

        <View style={s.card}>
          <Text style={s.label}>CHAMBER NAME</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Project Alpha"
            placeholderTextColor={Colors.slate[700]}
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={s.btn} onPress={handleCreate} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={Colors.ghost[950]} /> : (
              <Text style={s.btnText}>CREATE & ENTER</Text>
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
    width: 72, height: 72, borderRadius: 24, backgroundColor: Colors.accent.emerald + '15',
    borderWidth: 1, borderColor: Colors.accent.emerald + '30',
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
    color: Colors.white, fontSize: 14, fontWeight: '600', marginBottom: 16,
  },
  btn: {
    backgroundColor: Colors.accent.emerald, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center',
  },
  btnText: { color: Colors.ghost[950], fontWeight: '900', fontSize: 13, letterSpacing: 2 },
});
