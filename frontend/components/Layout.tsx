import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Shield, LayoutDashboard, LogOut, User, Ghost } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('ghost_auth_token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-ghost-950 text-slate-200 selection:bg-accent-emerald/30 selection:text-accent-emerald">
      <Head>
        <title>GhostRoom | Private Meeting Engine</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&display=swap" rel="stylesheet" />
      </Head>

      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-accent-emerald/20 text-accent-emerald rounded-xl flex items-center justify-center group-hover:bg-accent-emerald group-hover:text-ghost-950 transition-all duration-500 shadow-lg shadow-accent-emerald/10">
                <Ghost size={24} className="animate-float" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase italic">GhostRoom</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`p-2 rounded-lg transition-all ${router.pathname === '/dashboard' ? 'bg-accent-emerald/10 text-accent-emerald' : 'text-slate-400 hover:text-white'}`}
                >
                  <LayoutDashboard size={20} />
                </Link>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                  <div className="w-7 h-7 bg-ghost-700 rounded-full flex items-center justify-center text-[10px] font-bold text-accent-emerald border border-accent-emerald/20 overflow-hidden">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                        user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-300 hidden md:block">{user.username}</span>
                  <button onClick={handleLogout} className="text-slate-500 hover:text-accent-rose transition-colors ml-2">
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
                <div className="flex gap-4">
                    <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Login</Link>
                    <Link href="/auth/signup" className="px-4 py-1.5 bg-accent-emerald text-ghost-950 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-white transition-all">Join Now</Link>
                </div>
            )}
          </div>
        </div>
      </nav>

      <main className="animate-in fade-in duration-700">
        <div className="max-w-[1600px] mx-auto py-8 px-6">
          {children}
        </div>
      </main>

      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
                © 2026 GhostRoom Platform • Encrypted & Self-Hosted
            </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
