import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    router.replace('/(tabs)/dashboard');
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email and password are required');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        router.replace('/(tabs)/dashboard');
      } else {
        if (!username || !fullName) return Alert.alert('Error', 'All fields are required');
        await signup(email, password, username, fullName);
        Alert.alert('Success', 'Account created! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoIcon}>
            <Ionicons name="shield-checkmark" size={36} color={Colors.accent.emerald} />
          </View>
          <Text style={s.title}>GHOST<Text style={{ color: Colors.accent.emerald }}>ROOM</Text></Text>
          <Text style={s.subtitle}>{mode === 'login' ? 'NEURAL LOGIN' : 'ACCESS REGISTRY'}</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          {mode === 'signup' && (
            <>
              <TextInput style={s.input} placeholder="CHAMBER ALIAS" placeholderTextColor={Colors.slate[700]} value={username} onChangeText={setUsername} autoCapitalize="none" />
              <TextInput style={s.input} placeholder="FULL OPERATOR NAME" placeholderTextColor={Colors.slate[700]} value={fullName} onChangeText={setFullName} />
            </>
          )}
          <TextInput style={s.input} placeholder="NEURAL ADDRESS" placeholderTextColor={Colors.slate[700]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="ACCESS CODE" placeholderTextColor={Colors.slate[700]} value={password} onChangeText={setPassword} secureTextEntry />
          
          <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color={Colors.ghost[950]} /> : (
              <Text style={s.btnText}>{mode === 'login' ? 'AUTHENTICATE' : 'INITIALIZE CLEARANCE'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={s.toggle}>
            {mode === 'login' ? 'Elevate Clearance? Request Access' : 'Existing Operator? Secure Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950] },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 40 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: Colors.accent.emerald + '15',
    borderWidth: 1, borderColor: Colors.accent.emerald + '30',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 36, fontWeight: '900', color: Colors.white, letterSpacing: -1, fontStyle: 'italic' },
  subtitle: { fontSize: 10, fontWeight: '800', color: Colors.slate[500], letterSpacing: 4, marginTop: 8 },
  card: {
    backgroundColor: Colors.ghost[900], borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    backgroundColor: Colors.ghost[950], borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16,
    color: Colors.white, fontSize: 13, fontWeight: '600', marginBottom: 12,
  },
  btn: {
    backgroundColor: Colors.accent.emerald, borderRadius: 16, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: Colors.ghost[950], fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  toggle: { color: Colors.slate[500], fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 24, letterSpacing: 1 },
});
