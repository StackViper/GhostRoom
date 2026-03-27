import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Users, Search, ArrowRight, Shield, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalRoomId = roomId.trim();
      let finalToken = '';

      // Smart Parsing: detect invite links, full URLs, or raw IDs
      if (finalRoomId.includes('/join/')) {
          // It's a direct invite link — extract token and use the invite flow
          const token = finalRoomId.split('/join/').pop() || '';
          window.location.href = `/join/${token}`;
          return;
      } else if (finalRoomId.includes('?token=')) {
          const url = new URL(finalRoomId);
          finalRoomId = url.pathname.split('/').pop() || '';
          finalToken = url.searchParams.get('token') || '';
      } else if (finalRoomId.includes('/room/')) {
          finalRoomId = finalRoomId.split('/room/')[1].split('?')[0];
      }

      await axios.post('http://localhost:4000/api/rooms/join', { 
          roomId: finalRoomId, 
          token: finalToken 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ghost_auth_token')}` }
      });
      window.location.href = `/room/${finalRoomId}`;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-16 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
            <div className="w-20 h-20 bg-accent-cyan/10 text-accent-cyan rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-cyan/20 shadow-xl">
                <Link2 size={36} />
            </div>
            <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tighter italic">Join Chamber</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Paste an invite link or Room ID to enter</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleJoin} 
          className="space-y-8 glass-card p-10"
        >
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 ml-1">Invite Link / Room ID / Access Code</label>
            <div className="relative group/input">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-accent-emerald transition-colors" size={18} />
                <input 
                  required
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="https://ghostroom.app/join/abc123... or paste Room ID"
                  className="w-full bg-ghost-950 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm font-semibold text-white focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-accent-emerald hover:bg-white text-ghost-950 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-accent-emerald/20 disabled:opacity-20 flex items-center justify-center gap-3 group active:scale-[0.98]"
          >
            {loading ? 'Decrypting Access...' : 'Enter GhostRoom'}
            {!loading && <ArrowRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </motion.form>
      </div>
    </Layout>
  );
}
