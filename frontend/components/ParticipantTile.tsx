import React, { useEffect, useRef } from 'react';
import { User } from 'lucide-react';

interface ParticipantTileProps {
  stream: MediaStream;
  username: string;
  isLocal?: boolean;
  isPinned?: boolean;
  isCompact?: boolean;
}

const ParticipantTile: React.FC<ParticipantTileProps> = ({ stream, username, isLocal, isPinned, isCompact }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative ${isCompact ? 'aspect-video' : 'h-full w-full'} glass-card overflow-hidden group shadow-2xl transition-all duration-700 hover:border-accent-emerald/30 interactive-accent`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full ${isPinned ? 'object-contain' : 'object-cover'}`}
      />
      
      {/* Name Overlay */}
      {!isCompact && (
          <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 glass rounded-2xl border border-white/5 shadow-2xl">
            <div className="w-2.5 h-2.5 bg-accent-emerald rounded-full animate-pulse-emerald shadow-lg shadow-accent-emerald/40" />
            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
              {username} {isLocal && ' (YOU)'}
            </span>
          </div>
      )}

      {isCompact && (
          <div className="absolute bottom-3 left-3 px-2 py-1 glass rounded-md text-[8px] font-black uppercase tracking-widest text-slate-300">
              {username}
          </div>
      )}

      {/* Placeholder when no video */}
      {!stream.getVideoTracks().some(t => t.enabled) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
           <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-700">
              <User size={40} className="text-gray-500" />
           </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantTile;
