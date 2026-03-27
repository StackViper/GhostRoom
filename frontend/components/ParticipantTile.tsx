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
    <div className={`relative ${isCompact ? 'aspect-video' : 'h-full w-full'} bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden group`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full ${isPinned ? 'object-contain' : 'object-cover'}`}
      />
      
      {/* Name Overlay */}
      {!isCompact && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-gray-700/50">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-bold text-white tracking-wide">
              {username} {isLocal && '(You)'}
            </span>
          </div>
      )}

      {isCompact && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-black uppercase text-white">
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
