import React, { useState } from 'react';
import AuthForm from './AuthForm';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const GATEWAY_URL = 'http://localhost:4000';
      const endpoint = mode === 'signup' ? `${GATEWAY_URL}/api/auth/signup` : `${GATEWAY_URL}/api/auth/login`;
      const response = await axios.post(endpoint, data);

      if (mode === 'login') {
        const { internalToken, user } = response.data;
        localStorage.setItem('ghost_auth_token', internalToken);
        localStorage.setItem('user', JSON.stringify(user));
        onClose();
        window.location.href = '/dashboard'; 
      } else {
        setMode('login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ghost-950/60 backdrop-blur-xl" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden group/modal"
          >
            <button 
                onClick={onClose} 
                className="absolute top-6 right-6 text-slate-500 hover:text-white z-20 p-2 glass rounded-xl transition-all"
            >
                <X size={18} />
            </button>
            
            <div className="relative">
              {error && (
                <div className="absolute top-24 left-0 right-0 z-20 px-8">
                    <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-[10px] font-black uppercase tracking-widest py-3 rounded-xl text-center backdrop-blur-md">
                        {error}
                    </div>
                </div>
              )}
              
              <AuthForm type={mode} onSubmit={handleSubmit} isLoading={loading} />
              
              <div className="px-10 py-6 bg-white/5 border-t border-white/5 text-center backdrop-blur-3xl">
                <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} 
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-accent-emerald transition-colors"
                >
                    {mode === 'login' ? "Elevate Clearance? Request Access" : "Existing Operator? Secure Login"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
