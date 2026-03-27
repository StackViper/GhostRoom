import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Users, Video, Clock, ChevronRight, Monitor, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/rooms/my-rooms', {
          headers: { Authorization: `Bearer ${localStorage.getItem('ghost_auth_token')}` }
        });
        setRooms(response.data);
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
               Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-emerald to-accent-cyan">{user?.full_name?.split(' ')[0] || 'Ghost'}</span>
             </h1>
             <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
               <ShieldCheck size={16} className="text-accent-emerald" /> 
               Your private workspace is secured and ready.
             </p>
          </motion.div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Link href="/dashboard/create" className="flex-1 md:flex-none">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-accent-emerald text-ghost-950 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white hover:scale-105 active:scale-95 shadow-xl shadow-accent-emerald/20">
                <Plus size={20} strokeWidth={3} /> New Room
              </button>
            </Link>
            <Link href="/dashboard/join" className="flex-1 md:flex-none">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 backdrop-blur-md">
                <Users size={20} strokeWidth={3} /> Join
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-2 border-accent-emerald border-t-transparent rounded-full animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">Synchronizing...</span>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 glass-card border-dashed border-white/10"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Monitor size={40} className="text-slate-700" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter italic">No Active Chambers</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium">Create your first private meeting room to start sharing encrypted files and using local AI features.</p>
            <Link href="/dashboard/create">
                <button className="px-8 py-3 bg-white/5 hover:bg-white/10 text-accent-emerald border border-accent-emerald/20 rounded-xl font-black uppercase tracking-widest transition-all">
                  Initialize First Room
                </button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <RoomCard room={room} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function RoomCard({ room }: { room: any }) {
  return (
    <Link href={`/room/${room.id}`}>
      <div className="group glass-card p-8 flex flex-col h-full interactive-accent">
        <div className="flex justify-between items-start mb-10">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-accent-cyan group-hover:bg-accent-cyan group-hover:text-ghost-950 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl">
            <Video size={28} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-ghost-950 rounded-lg border border-white/5">
            <div className="w-1.5 h-1.5 bg-accent-emerald rounded-full animate-pulse-emerald" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(room.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-10 flex-1">
            <h3 className="text-2xl font-black text-white group-hover:text-accent-emerald transition-colors uppercase tracking-tighter truncate leading-tight italic">
              {room.name}
            </h3>
            <p className="text-slate-500 text-xs font-bold leading-relaxed tracking-wide">
              Secured with AES-GCM 256-bit Encryption & Local AI-Guard
            </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-accent-emerald font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
            Enter Chamber <ChevronRight size={14} strokeWidth={3} />
          </div>
          <div className="flex -space-x-3">
            {[1, 2].map(i => (
              <div key={i} className="w-8 h-8 rounded-xl bg-ghost-800 border-2 border-ghost-950 flex items-center justify-center text-[10px] font-black text-slate-500 glass">
                ?
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
