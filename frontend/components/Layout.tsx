import React, { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('ghost_auth_token'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Head>
        <title>GhostRoom - Private & Secure</title>
      </Head>
      
      <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold text-blue-400">
          GhostRoom
        </div>
        <div className="flex items-center space-x-4">
           {isLoggedIn ? (
             <span className="text-xs text-gray-500">Logged In</span>
           ) : (
             <span className="text-xs text-gray-500">Guest Mode</span>
           )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
        {children}
      </main>

      <footer className="py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        &copy; 2026 GhostRoom Platform.
      </footer>
    </div>
  );
}
