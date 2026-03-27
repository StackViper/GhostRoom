import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, Ghost } from 'lucide-react';

interface AuthFormProps {
  type: 'login' | 'signup';
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function AuthForm({ type, onSubmit, isLoading = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'signup') {
      onSubmit({ email, password, username, fullName });
    } else {
      onSubmit({ email, password });
    }
  };

  return (
    <div className="w-full glass-card p-10 shadow-4xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-emerald/10 blur-[80px] rounded-full" />
      
      <div className="relative z-10 flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-accent-emerald/10 text-accent-emerald rounded-2xl flex items-center justify-center mb-6 border border-accent-emerald/20 shadow-xl group-hover:bg-accent-emerald group-hover:text-ghost-950 transition-all duration-700">
            <Ghost size={32} strokeWidth={2.5} />
        </div>
        <h2 className="text-4xl font-black text-white text-center uppercase tracking-tighter italic">
          {type === 'signup' ? 'Access Registry' : 'Neural Login'}
        </h2>
        <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-[0.3em]">Secure Protocols Active</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {type === 'signup' && (
          <div className="space-y-4">
            <div className="relative group/input">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-accent-emerald transition-colors" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-ghost-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700"
                  placeholder="CHAMBER ALIAS"
                  required
                />
            </div>
            <div className="relative group/input">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-accent-emerald transition-colors" size={18} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-ghost-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700"
                  placeholder="FULL OPERATOR NAME"
                  required
                />
            </div>
          </div>
        )}

        <div className="relative group/input">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-accent-emerald transition-colors" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-ghost-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700"
              placeholder="NEURAL ADDRESS"
              required
            />
        </div>

        <div className="relative group/input">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-accent-emerald transition-colors" size={18} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-ghost-950 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold focus:outline-none focus:border-accent-emerald/50 transition-all placeholder-slate-700"
              placeholder="ACCESS CODE"
              required
            />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-accent-emerald hover:bg-white text-ghost-950 font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-accent-emerald/20 disabled:opacity-20 active:scale-[0.98] mt-4"
        >
          {isLoading ? 'Processing Neural Data...' : (type === 'signup' ? 'Initialize Clearance' : 'Authenticate')}
        </button>
      </form>
    </div>
  );
}
