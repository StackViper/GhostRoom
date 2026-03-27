import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Link from 'next/link';
import axios from 'axios';
import { Plus, Users, Video, Clock } from 'lucide-react';

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const fetchRooms = async () => {
      try {
        const response = await axios.get('/api/rooms/my-rooms', {
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <div>
             <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.full_name || 'Ghost'}!</h1>
             <p className="text-gray-400">Manage your private rooms and active sessions.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/create">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                <Plus size={20} /> New Room
              </button>
            </Link>
            <Link href="/dashboard/join">
              <button className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-700">
                <Users size={20} /> Join Room
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
              <Video size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No active rooms found</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Create your first private meeting room to start sharing encrypted files and AI features.</p>
            <Link href="/dashboard/create">
                <button className="text-blue-400 font-bold hover:underline">Create a room now &rarr;</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
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
      <div className="p-6 bg-gray-900 border border-gray-800 rounded-3xl hover:border-blue-500/50 transition-all group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
            <Video size={24} />
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 py-1 bg-gray-800 rounded-full">
            <Clock size={10} /> {new Date(room.created_at).toLocaleDateString()}
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase truncate">{room.name}</h3>
        <p className="text-gray-500 text-sm mb-6">Secured with E2EE & AI-Guard</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <span className="text-xs text-blue-500 font-bold">Enter Room</span>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-950 flex items-center justify-center text-[8px] text-gray-400">
                U{i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
