import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, X } from 'lucide-react';
import { uploadFile, downloadAndDecryptFile } from '../services/storageService';
import axios from 'axios';

interface Message {
  senderName: string;
  senderId: string;
  content: string;
  type?: 'text' | 'image';
  fileData?: { url: string; key: string; iv: string };
  timestamp: Date;
}

interface ChatViewProps {
  roomId: string;
  socket: any;
  roomName?: string;
}

export default function ChatView({ roomId, socket, roomName = 'Discussion' }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    socket.emit('join_room', { 
      roomId, 
      userId: user?.id || 'anonymous', 
      username: user?.username || 'Ghost' 
    });

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/api/chat/${roomId}`);
        const history = response.data;
        
        const decryptedHistory = await Promise.all(history.map(async (msg: any) => {
          if (msg.type === 'image' && msg.fileData) {
            try {
              const url = await downloadAndDecryptFile(msg.fileData.url, msg.fileData.key, msg.fileData.iv);
              return { ...msg, content: url };
            } catch (e) {
              return { ...msg, content: '[Decryption Failed]' };
            }
          }
          return msg;
        }));

        setMessages(decryptedHistory);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      }
    };

    fetchHistory();

    const handleNewMessage = async (msg: Message) => {
      if (msg.type === 'image' && msg.fileData) {
        try {
          const decryptedUrl = await downloadAndDecryptFile(
            msg.fileData.url, 
            msg.fileData.key, 
            msg.fileData.iv
          );
          msg.content = decryptedUrl;
        } catch (e) {
          msg.content = '[Decryption Failed]';
        }
      }
      setMessages(prev => [...prev, msg]);
    };

    socket.on('new_message', handleNewMessage);
    return () => { socket.off('new_message', handleNewMessage); };
  }, [roomId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSummarize = async () => {
    if (messages.length < 2) return alert('Not enough messages to summarize!');
    
    setIsSummarizing(true);
    setSummary(null);
    try {
      const response = await axios.post('/api/ai/summarize', {
        messages: messages.map(m => ({ sender: m.senderName, text: m.content })),
        roomName
      });
      setSummary(response.data.summary);
    } catch (err) {
      console.error('AI Summary failed:', err);
      alert('Failed to generate summary. Make sure GEMINI_API_KEY is configured in .env');
    } finally {
      setIsSummarizing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const msgData = {
      roomId,
      type: 'text',
      content: newMessage,
      senderName: 'You',
      senderId: 'current-user-id', // In production, this comes from auth
      timestamp: new Date()
    };

    socket.emit('send_message', msgData);
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url, key, iv } = await uploadFile(file, roomId);
      socket.emit('send_message', {
        roomId,
        type: 'image',
        content: '[Image File]',
        fileData: { url, key, iv },
        senderName: 'You',
        senderId: 'current-user-id'
      });
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">{roomName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20 active:scale-95"
          >
            {isSummarizing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            AI BRIEF
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/50 rounded-xl transition-all disabled:opacity-50"
            title="Upload Encrypted Image"
          >
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <ImageIcon size={20} />}
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
        </div>
      </div>

      {/* AI Summary Overlay */}
      {summary && (
        <div className="m-4 p-5 bg-blue-900/20 border border-blue-500/30 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative">
          <button 
            onClick={() => setSummary(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles size={14} /> AI Session Insight
          </div>
          <p className="text-gray-300 text-sm italic leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600">
            <Send size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">No messages yet. Lead the way!</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.senderName === 'You' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 ml-1">{m.senderName}</span>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
              m.senderName === 'You' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-600/10' 
                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
            }`}>
              {m.type === 'image' ? (
                <div className="relative group">
                  <img src={m.content} alt="shared" className="rounded-xl max-h-80 w-full object-cover shadow-md" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold px-3 py-1 bg-black/50 rounded-full backdrop-blur-sm">E2EE Encrypted</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
            <span className="text-[9px] text-gray-600 mt-1 mx-1">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-950/80 backdrop-blur-md border-t border-gray-800 flex gap-3">
        <input 
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message (End-to-End Encrypted)..."
          className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-600 text-gray-200 shadow-inner"
        />
        <button 
          onClick={sendMessage}
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
