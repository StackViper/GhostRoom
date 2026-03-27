import React, { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, Sparkles, Loader2, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-accent-emerald rounded-full animate-pulse-emerald shadow-lg shadow-accent-emerald/40" />
          <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">{roomName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSummarize}
            disabled={isSummarizing}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-ghost-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 hover:bg-white active:scale-95 shadow-lg shadow-accent-cyan/10"
          >
            {isSummarizing ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
            NEURAL BRIEF
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 text-slate-400 hover:text-white bg-white/5 border border-white/5 rounded-xl transition-all disabled:opacity-50"
            title="Upload Encrypted Image"
          >
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <ImageIcon size={18} />}
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
        </div>
      </div>

      {/* AI Summary Overlay */}
      <AnimatePresence>
        {summary && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="m-4 p-5 bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl relative glass shadow-2xl"
            >
                <button 
                    onClick={() => setSummary(null)}
                    className="absolute top-3 right-3 text-slate-500 hover:text-white"
                >
                    <X size={14} />
                </button>
                <div className="flex items-center gap-2 mb-3 text-accent-cyan font-black text-[10px] uppercase tracking-widest">
                    <Sparkles size={12} /> AI Intelligence Report
                </div>
                <p className="text-slate-300 text-xs italic leading-relaxed font-medium">{summary}</p>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 opacity-40">
            <ShieldCheck size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Channel Established</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.senderName === 'You' ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] mb-2 px-1">{m.senderName}</span>
            <div className={`max-w-[90%] rounded-2xl px-5 py-3 shadow-2xl relative group ${
              m.senderName === 'You' 
                ? 'bg-accent-emerald text-ghost-950 rounded-tr-none font-semibold' 
                : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'
            }`}>
              {m.type === 'image' ? (
                <div className="relative overflow-hidden rounded-xl border border-white/10">
                  <img src={m.content} alt="shared" className="max-h-80 w-full object-cover" />
                  <div className="absolute inset-0 bg-ghost-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <ShieldCheck size={24} className="mb-2 text-accent-emerald" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white">E2EE Verified</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
            <span className="text-[8px] text-slate-700 font-black uppercase mt-2 px-1 tracking-widest">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 backdrop-blur-3xl border-t border-white/5">
        <div className="relative flex items-center gap-3">
            <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Neural Transmission (Encrypted)..."
                className="flex-1 bg-ghost-950 border border-white/10 rounded-2xl px-6 py-4 text-xs font-semibold focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700 text-slate-200 shadow-inner"
            />
            <button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="bg-accent-emerald hover:bg-white text-ghost-950 p-4 rounded-xl shadow-xl shadow-accent-emerald/10 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
                <Send size={18} strokeWidth={3} />
            </button>
        </div>
      </div>
    </div>
  );
}
