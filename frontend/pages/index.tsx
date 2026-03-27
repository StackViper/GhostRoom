import Layout from '../components/Layout';
import { Shield, Zap, Users, Camera } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import AuthModal from '../components/AuthModal';

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
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          GHOSTROOM
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl">
          The ultimate private platform for virtual meetings, study sessions, and high-speed E2EE file sharing.
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-20">
          <button 
            onClick={() => handleAction('signup')}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            Get Started
          </button>
          <button 
            onClick={() => handleAction('login')}
            className="px-10 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full font-bold transition-all transform hover:scale-105 border border-gray-700"
          >
            Sign In
          </button>
        </div>

        {/* Home Auth Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          initialMode={modalMode}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left max-w-6xl w-full">
          <FeatureCard 
            icon={<Shield className="text-blue-500" />}
            title="E2EE Security"
            desc="Every message and file is encrypted on your device. Only you and your room members can see them."
          />
          <FeatureCard 
            icon={<Zap className="text-yellow-500" />}
            title="Ultra Fast"
            desc="Optimized microservices architecture built with Node.js and Redis for lightning-speed responses."
          />
          <FeatureCard 
            icon={<Camera className="text-purple-500" />}
            title="AI Privacy"
            desc="Local AI background blur and replacement. Your video data never leaves your browser."
          />
          <FeatureCard 
            icon={<Users className="text-green-500" />}
            title="Scalable"
            desc="Built for high-concurrency. Handles thousands of users sharing images simultaneously."
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl hover:border-blue-500/50 transition-all group">
      <div className="mb-6 p-3 bg-gray-800/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement, { size: 32 })}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
