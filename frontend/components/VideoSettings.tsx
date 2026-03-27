import React, { useState } from 'react';
import { BackgroundEffect } from '../services/BackgroundManager';

const BACKGROUNDS = [
  { id: 'none', label: 'Original', icon: '📷' },
  { id: 'blur', label: 'Blur', icon: '🌫️' },
  { id: 'office', label: 'Office', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c', icon: '🏢' },
  { id: 'nature', label: 'Nature', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', icon: '🌿' },
  { id: 'studio', label: 'Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04', icon: '🎙️' },
];

export default function VideoSettings({ onEffectChange }: { onEffectChange: (effect: BackgroundEffect, url?: string) => void }) {
  const [selected, setSelected] = useState('none');

  const handleSelect = (id: string, url?: string) => {
    setSelected(id);
    const effect: BackgroundEffect = id === 'blur' ? 'blur' : (id === 'none' ? 'none' : 'image');
    onEffectChange(effect, url);
  };

  return (
    <div className="p-6 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl max-w-sm">
      <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Video Appearance
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => handleSelect(bg.id, bg.url)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              selected === bg.id 
                ? 'bg-purple-600/20 border-purple-500 text-white' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <span className="text-2xl mb-1">{bg.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-tighter">{bg.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
