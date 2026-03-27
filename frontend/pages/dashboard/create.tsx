import React, { useState } from 'react';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Camera, Shield, ArrowRight } from 'lucide-react';

export default function CreateRoom() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const GATEWAY_URL = 'http://localhost:4000';
      const response = await axios.post(`${GATEWAY_URL}/api/rooms/create`, { name }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('ghost_auth_token')}` }
      });
      window.location.href = `/room/${response.data.id}`;
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Camera size={32} />
            </div>
            <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Create Private Room</h1>
            <p className="text-gray-400">Namespace your secure space for meetings and file sharing.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-6 bg-gray-900 p-10 rounded-3xl border border-gray-800 shadow-2xl">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Room Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Design Strategy 2024"
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-700"
            />
          </div>

          <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-2xl flex items-start gap-4">
            <Shield className="text-blue-500 mt-1 shrink-0" size={18} />
            <p className="text-xs text-gray-400 leading-relaxed">
              This room will automatically be secured with **AES-GCM 256-bit** encryption. All files shared will be unreadable by anyone outside this room.
            </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
          >
            {loading ? 'Creating...' : 'Initialize Secure Room'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </Layout>
  );
}
