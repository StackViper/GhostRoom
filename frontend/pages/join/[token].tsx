import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import axios from 'axios';
import { Shield, Loader2, Ghost, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function JoinByInvite() {
  const router = useRouter();
  const { token } = router.query;
  const [status, setStatus] = useState<'loading' | 'auth_required' | 'joining' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    if (!token) return;

    const authToken = localStorage.getItem('ghost_auth_token');
    
    // If not logged in, save invite link and redirect to login
    if (!authToken) {
      localStorage.setItem('pending_invite', token as string);
      setStatus('auth_required');
      return;
    }

    // Auto-join flow
    const autoJoin = async () => {
      try {
        setStatus('loading');

        // Step 1: Look up the room by invite token
        const lookupRes = await axios.get(`http://localhost:4000/api/rooms/invite-lookup/${token}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        const { roomId, roomName: name, accessToken } = lookupRes.data;
        setRoomName(name);
        setStatus('joining');

        // Step 2: Join the room
        await axios.post('http://localhost:4000/api/rooms/join', {
          roomId,
          token: accessToken
        }, {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        // Step 3: Redirect to the room
        localStorage.removeItem('pending_invite');
        router.replace(`/room/${roomId}`);
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Failed to join room. The invite link may be invalid or expired.';
        setErrorMsg(msg);
        setStatus('error');
      }
    };

    autoJoin();
  }, [token]);

  // Check for pending invite after login redirect
  useEffect(() => {
    const pendingInvite = localStorage.getItem('pending_invite');
    if (pendingInvite && localStorage.getItem('ghost_auth_token') && !token) {
      router.replace(`/join/${pendingInvite}`);
    }
  }, []);

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 max-w-lg w-full text-center"
        >
          {status === 'loading' && (
            <>
              <div className="w-20 h-20 bg-accent-emerald/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-emerald/20">
                <Loader2 size={36} className="text-accent-emerald animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Validating Invite</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Decrypting access credentials...</p>
            </>
          )}

          {status === 'joining' && (
            <>
              <div className="w-20 h-20 bg-accent-emerald/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-emerald/20 animate-pulse">
                <Shield size={36} className="text-accent-emerald" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Entering Chamber</h1>
              <p className="text-accent-emerald text-sm font-bold uppercase tracking-widest">{roomName}</p>
              <p className="text-slate-600 text-xs font-bold uppercase tracking-widest mt-4">Establishing encrypted tunnel...</p>
            </>
          )}

          {status === 'auth_required' && (
            <>
              <div className="w-20 h-20 bg-accent-cyan/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-cyan/20">
                <Ghost size={36} className="text-accent-cyan" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Authentication Required</h1>
              <p className="text-slate-500 text-sm mb-8">You need to log in before joining this room. Your invite will be saved.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <button className="px-8 py-4 bg-accent-emerald text-ghost-950 rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white active:scale-95 shadow-xl shadow-accent-emerald/20">
                    Log In
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white/10 border border-white/10">
                    Sign Up
                  </button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-accent-rose/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-rose/20">
                <AlertTriangle size={36} className="text-accent-rose" />
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-3">Access Denied</h1>
              <p className="text-slate-500 text-sm mb-8">{errorMsg}</p>
              <div className="flex gap-4 justify-center">
                <Link href="/dashboard">
                  <button className="px-8 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest transition-all hover:bg-white/10 border border-white/10">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
