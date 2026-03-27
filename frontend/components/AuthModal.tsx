import React, { useState } from 'react';
import AuthForm from './AuthForm';
import axios from 'axios';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const GATEWAY_URL = 'http://localhost:4000';
      const endpoint = mode === 'signup' ? `${GATEWAY_URL}/api/auth/signup` : `${GATEWAY_URL}/api/auth/login`;
      const response = await axios.post(endpoint, data);

      if (mode === 'login') {
        const { internalToken, user } = response.data;
        console.log('[Auth] Login Success, Token received:', internalToken.substring(0, 10) + '...');
        localStorage.setItem('ghost_auth_token', internalToken);
        localStorage.setItem('user', JSON.stringify(user));
        onClose();
        window.location.href = '/dashboard'; 
      } else {
        alert('Account created! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-white p-2">✕</button>
        <div className="p-4">
          {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
          <AuthForm type={mode} onSubmit={handleSubmit} isLoading={loading} />
        </div>
        <div className="p-4 bg-gray-950 text-center">
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-blue-400">
            {mode === 'login' ? "Need an account? Sign Up" : "Have an account? Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
