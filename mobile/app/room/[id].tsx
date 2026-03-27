import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { getRoomDetails } from '../../services/api';
import { useAuth } from '../../services/AuthContext';
import { io, Socket } from 'socket.io-client';
import { REALTIME_URL } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  senderName: string;
  content: string;
  timestamp: Date;
}

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [participants, setParticipants] = useState(1);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id) return;

    const init = async () => {
      try {
        const roomData = await getRoomDetails(id);
        setRoom(roomData);
      } catch (err) {
        Alert.alert('Error', 'Failed to load room');
        router.back();
      }

      const token = await AsyncStorage.getItem('ghost_auth_token');
      const sock = io(REALTIME_URL, { query: { roomId: id, token } });
      socketRef.current = sock;

      sock.emit('join_room', {
        roomId: id,
        userId: user?.id,
        username: user?.username || 'Ghost',
      });

      sock.on('room_users', ({ users }) => {
        setParticipants(users.length + 1);
      });

      sock.on('user_joined', () => {
        setParticipants((p) => p + 1);
      });

      sock.on('user_left', () => {
        setParticipants((p) => Math.max(1, p - 1));
      });

      sock.on('new_message', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });
    };

    init();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [id]);

  const sendMessage = () => {
    if (!newMsg.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', {
      roomId: id,
      type: 'text',
      content: newMsg,
      senderName: user?.username || 'Ghost',
      senderId: user?.id,
      timestamp: new Date(),
    });
    setNewMsg('');
  };

  const copyInvite = async () => {
    if (!room) return;
    await Clipboard.setStringAsync(`https://ghostroom.app/join/${room.access_token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderName === (user?.username || 'Ghost');
    return (
      <View style={[s.msgWrap, isMe ? s.msgRight : s.msgLeft]}>
        <Text style={s.msgSender}>{item.senderName}</Text>
        <View style={[s.msgBubble, isMe ? s.myBubble : s.otherBubble]}>
          <Text style={[s.msgText, isMe && { color: Colors.ghost[950] }]}>{item.content}</Text>
        </View>
        <Text style={s.msgTime}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.roomName} numberOfLines={1}>{room?.name || 'Loading...'}</Text>
          <View style={s.headerMeta}>
            <View style={s.liveDot} />
            <Text style={s.participantText}>{participants} IN CHAMBER</Text>
          </View>
        </View>
        <TouchableOpacity onPress={copyInvite} style={[s.shareBtn, copied && { backgroundColor: Colors.accent.emerald + '20' }]}>
          <Ionicons name={copied ? 'checkmark' : 'share-outline'} size={18} color={copied ? Colors.accent.emerald : Colors.slate[400]} />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView style={s.chatContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={s.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="shield-checkmark" size={40} color={Colors.slate[700]} />
              <Text style={s.emptyText}>ENCRYPTED CHANNEL ESTABLISHED</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="Neural Transmission..."
            placeholderTextColor={Colors.slate[700]}
            value={newMsg}
            onChangeText={setNewMsg}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={s.sendBtn} onPress={sendMessage} disabled={!newMsg.trim()}>
            <Ionicons name="send" size={18} color={Colors.ghost[950]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Leave Button */}
      <TouchableOpacity style={s.leaveBtn} onPress={() => router.back()}>
        <Text style={s.leaveText}>LEAVE CHAMBER</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ghost[950] },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: Colors.ghost[900],
  },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, marginLeft: 8 },
  roomName: { fontSize: 16, fontWeight: '900', color: Colors.white, fontStyle: 'italic' },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent.emerald },
  participantText: { fontSize: 9, fontWeight: '800', color: Colors.slate[500], letterSpacing: 3 },
  shareBtn: {
    padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chatContainer: { flex: 1 },
  messagesList: { padding: 16, gap: 16 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 9, fontWeight: '800', color: Colors.slate[700], letterSpacing: 4, marginTop: 12 },
  msgWrap: { marginBottom: 4 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  msgSender: { fontSize: 9, fontWeight: '800', color: Colors.slate[600], letterSpacing: 2, marginBottom: 4, paddingHorizontal: 4 },
  msgBubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  myBubble: { backgroundColor: Colors.accent.emerald, borderBottomRightRadius: 4 },
  otherBubble: { backgroundColor: Colors.ghost[800], borderBottomLeftRadius: 4 },
  msgText: { fontSize: 14, color: Colors.slate[200], lineHeight: 20 },
  msgTime: { fontSize: 8, fontWeight: '800', color: Colors.slate[700], letterSpacing: 2, marginTop: 4, paddingHorizontal: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: Colors.ghost[900],
  },
  input: {
    flex: 1, backgroundColor: Colors.ghost[950], borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.white, fontSize: 13, fontWeight: '600',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.accent.emerald,
    alignItems: 'center', justifyContent: 'center',
  },
  leaveBtn: {
    marginHorizontal: 16, marginBottom: 16, paddingVertical: 14,
    backgroundColor: Colors.accent.rose + '10', borderRadius: 14,
    borderWidth: 1, borderColor: Colors.accent.rose + '20', alignItems: 'center',
  },
  leaveText: { fontSize: 11, fontWeight: '900', color: Colors.accent.rose, letterSpacing: 3 },
});
