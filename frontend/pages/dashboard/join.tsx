import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Users, Search, ArrowRight } from 'lucide-react';

export default function JoinRoom() {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalRoomId = roomId;
      let finalToken = '';

      // Smart Parsing: If user pasted a full link, extract components
      if (roomId.includes('?token=')) {
          const url = new URL(roomId);
          finalRoomId = url.pathname.split('/').pop() || '';
          finalToken = url.searchParams.get('token') || '';
      } else if (roomId.includes('/room/')) {
          finalRoomId = roomId.split('/room/')[1].split('?')[0];
      }

      await axios.post('/api/rooms/join', { 
          roomId: finalRoomId, 
          token: finalToken 
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ghost_auth_token')}` }
      });
      window.location.href = `/room/${finalRoomId}${finalToken ? `?token=${finalToken}` : ''}`;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-purple-600/20 text-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
            </div>
            <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Join Meeting</h1>
            <p className="text-gray-400">Enter the Room ID shared by the owner to enter.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6 bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Room ID / Invite Code</label>
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  required
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  placeholder="Paste Room ID here..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder-gray-700"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 group"
          >
            {loading ? 'Validating...' : 'Enter GhostRoom'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </Layout>
  );
}
