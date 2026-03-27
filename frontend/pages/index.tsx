import Layout from '../components/Layout';
import { Shield, Zap, Users, Camera, Ghost, ArrowRight, Lock, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AuthModal from '../components/AuthModal';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('ghost_auth_token'));
  }, []);

  const handleAction = (mode: 'login' | 'signup') => {
    if (isLoggedIn) {
      window.location.href = '/dashboard';
    } else {
      setModalMode(mode);
      setIsAuthModalOpen(true);
    }
  };

  return (
    <Layout>
      <div className="relative flex flex-col items-center justify-center min-h-[90vh] overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-emerald/5 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-cyan/5 blur-[150px] rounded-full -z-10" />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center px-6 max-w-5xl"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 glass rounded-full mb-8 border border-white/5 animate-pulse-emerald">
            <Sparkles size={14} className="text-accent-emerald" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Neural Privacy Protocol v2.0</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter italic uppercase">
            <span className="text-white drop-shadow-2xl">GHOST</span>
            <span className="text-accent-emerald drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">ROOM</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-2xl font-medium leading-relaxed uppercase tracking-tight">
            The elite portal for <span className="text-white">secure collaboration</span>. 
            Zero logs. Neural encryption. Total invisibility.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-24">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('signup')}
              className="px-12 py-5 bg-accent-emerald text-ghost-950 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-accent-emerald/20 flex items-center gap-3"
            >
              Initialize Access
              <ArrowRight size={18} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAction('login')}
              className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all border border-white/5 backdrop-blur-md"
            >
              Registry Login
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <FeatureCard 
              icon={<Shield size={24} />}
              title="ELITE SEC"
              desc="Full-spectrum E2EE cryptographic tunnels."
              accent="emerald"
            />
            <FeatureCard 
              icon={<Zap size={24} />}
              title="NEURAL SYNC"
              desc="Micro-latency real-time coordination."
              accent="cyan"
            />
            <FeatureCard 
              icon={<Camera size={24} />}
              title="STEALTH AI"
              desc="On-device neural background morphing."
              accent="rose"
            />
            <FeatureCard 
              icon={<Lock size={24} />}
              title="ZERO TRACE"
              desc="Ephemeral sessions. No data persistency."
              accent="blue"
            />
          </div>
        </motion.div>

        {/* Global Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={modalMode}
        />
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc, accent }: any) {
  const accents: any = {
    emerald: 'text-accent-emerald border-accent-emerald/20 bg-accent-emerald/5',
    cyan: 'text-accent-cyan border-accent-cyan/20 bg-accent-cyan/5',
    rose: 'text-accent-rose border-accent-rose/20 bg-accent-rose/5',
    blue: 'text-blue-500 border-blue-500/20 bg-blue-500/5'
  };

  return (
    <motion.div 
        whileHover={{ y: -10 }}
        className="p-8 glass border border-white/5 rounded-4xl flex flex-col items-center text-center group transition-all hover:bg-white/5"
    >
      <div className={`mb-6 p-4 rounded-3xl ${accents[accent]} group-hover:scale-110 transition-transform shadow-xl`}>
        {icon}
      </div>
      <h3 className="text-xs font-black mb-3 text-white uppercase tracking-[0.3em]">{title}</h3>
      <p className="text-[10px] text-slate-500 uppercase font-black leading-relaxed tracking-widest">{desc}</p>
    </motion.div>
  );
}
