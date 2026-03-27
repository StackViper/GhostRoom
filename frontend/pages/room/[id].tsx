import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ChatView from '../../components/ChatView';
import VideoSettings from '../../components/VideoSettings';
import { BackgroundManager } from '../../services/BackgroundManager';
import ParticipantTile from '../../components/ParticipantTile';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Shield, Users, Activity, Settings, Maximize2, Ghost, PhoneOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const [socket, setSocket] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgManager = useRef<BackgroundManager | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<any[]>([]); // { socketId, stream, username }
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const [activeEffect, setActiveEffect] = useState<any>({ type: 'none', url: '' });
  const [user, setUser] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null); // 'self' or socketId

  useEffect(() => {
    if (!id) return;

    const userStr = localStorage.getItem('user');
    const userData = userStr ? JSON.parse(userStr) : null;
    setUser(userData);

    const newSocket = io('http://localhost:4004', {
      query: { roomId: id, token: localStorage.getItem('ghost_auth_token') }
    });
    setSocket(newSocket);

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);

        const manager = new BackgroundManager();
        await manager.init();
        bgManager.current = manager;

        const hiddenVideo = document.createElement('video');
        hiddenVideo.srcObject = stream;
        hiddenVideo.muted = true;
        hiddenVideo.play();
        manager.startProcessing(hiddenVideo);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // WebRTC Handlers
        newSocket.emit('join_room', { 
            roomId: id, 
            userId: userData?.id, 
            username: userData?.username || 'Ghost' 
        });

        newSocket.on('room_users', async ({ users }) => {
            console.log('Synchronizing with existing users:', users);
            for (const otherUser of users) {
                if (!peersRef.current[otherUser.socketId]) {
                    const peer = createPeer(otherUser.socketId, newSocket, stream, otherUser.username);
                    peersRef.current[otherUser.socketId] = peer;
                    const offer = await peer.createOffer();
                    await peer.setLocalDescription(offer);
                    newSocket.emit('signal_offer', { to: otherUser.socketId, offer });
                }
            }
        });

        newSocket.on('user_joined', async ({ socketId, username }) => {
            console.log('New user joined:', socketId, username);
            // We wait for them to send us an offer as they will see us in their room_users
        });

        newSocket.on('signal_offer', async ({ from, offer }) => {
            console.log('Received offer from:', from);
            // Check if we already have a peer for this user
            let peer = peersRef.current[from];
            if (!peer) {
                peer = createPeer(from, newSocket, stream, 'Guest');
                peersRef.current[from] = peer;
            }
            await peer.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            newSocket.emit('signal_answer', { to: from, answer });
        });

        newSocket.on('signal_answer', async ({ from, answer }) => {
            const peer = peersRef.current[from];
            if (peer) {
                await peer.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        newSocket.on('signal_ice', async ({ from, candidate }) => {
            const peer = peersRef.current[from];
            if (peer) {
                await peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        newSocket.on('user_left', ({ userId, socketId }) => {
            if (peersRef.current[socketId]) {
                peersRef.current[socketId].close();
                delete peersRef.current[socketId];
                setRemotePeers(prev => prev.filter(p => p.socketId !== socketId));
            }
        });

      } catch (err) {
        console.error('Failed to get media:', err);
      }
    };

    const fetchRoom = async () => {
        try {
            const response = await axios.get(`http://localhost:4000/api/rooms/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('ghost_auth_token')}` }
            });
            setRoom(response.data);
        } catch (err) {
            console.error('Failed to fetch room details:', err);
        }
    };

    fetchRoom();
    initMedia();

    return () => { 
      newSocket.disconnect(); 
      localStream?.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(peer => peer.close());
    };
  }, [id]);

  const copyInvite = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}/join/${room.access_token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(id?.toString() || '');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const createPeer = (socketId: string, socket: any, stream: MediaStream, username: string) => {
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('signal_ice', { to: socketId, candidate: event.candidate });
        }
    };

    peer.ontrack = (event) => {
        setRemotePeers(prev => {
            const exists = prev.find(p => p.socketId === socketId);
            if (exists) return prev;
            return [...prev, { socketId, stream: event.streams[0], username }];
        });
    };

    return peer;
  };

  const handleEffectChange = (effect: any, url?: string) => {
    setActiveEffect({ type: effect, url: url || '' });
    if (bgManager.current && videoRef.current) {
      bgManager.current.setEffect(effect, url);
      
      if (effect === 'none') {
        videoRef.current.srcObject = localStream;
      } else {
        // Use the processed canvas stream
        const canvas = bgManager.current.getCanvas();
        // @ts-ignore
        const processedStream = canvas.captureStream(30);
        
        // Preserve audio tracks from original stream
        localStream?.getAudioTracks().forEach(track => processedStream.addTrack(track));
        
        videoRef.current.srcObject = processedStream;
      }
    }
  };

  if (!id) return null;

  return (
    <Layout>
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">
        
        {/* Main Stage / Grid */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-4 overflow-hidden`}>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            {pinnedId ? (
                /* Stage Layout */
                <div className="h-full flex flex-col lg:flex-row gap-6">
                    {/* Large Pinned View */}
                    <div className="flex-[3] bg-ghost-950 border border-white/5 rounded-4xl overflow-hidden relative group shadow-2xl">
                        {pinnedId === 'self' ? (
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                        ) : (
                            <ParticipantTile 
                                stream={remotePeers.find(p => p.socketId === pinnedId)?.stream} 
                                username={remotePeers.find(p => p.socketId === pinnedId)?.username || 'Guest'} 
                                isPinned
                            />
                        )}
                        <button 
                          onClick={() => setPinnedId(null)}
                          className="absolute top-6 right-6 p-4 glass rounded-2xl text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Settings size={20} />
                        </button>
                    </div>

                    {/* Smaller Vertical Sidebar for others */}
                    <div className="flex-1 flex flex-col gap-4 min-w-[280px] overflow-y-auto custom-scrollbar pr-2">
                        {pinnedId !== 'self' && (
                            <motion.div 
                              whileHover={{ scale: 1.02 }}
                              className="cursor-pointer" 
                              onClick={() => setPinnedId('self')}
                            >
                                <div className="aspect-video bg-ghost-900 border border-white/5 rounded-3xl overflow-hidden relative shadow-lg">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    <div className="absolute bottom-3 left-3 px-2 py-1 glass rounded-md text-[10px] font-black uppercase tracking-widest">You</div>
                                </div>
                            </motion.div>
                        )}
                        {remotePeers.filter(p => p.socketId !== pinnedId).map(peer => (
                            <motion.div 
                              key={peer.socketId} 
                              whileHover={{ scale: 1.02 }}
                              className="cursor-pointer" 
                              onClick={() => setPinnedId(peer.socketId)}
                            >
                                <ParticipantTile stream={peer.stream} username={peer.username} isCompact />
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Multi-Equal Grid */
                <div className={`grid gap-6 ${
                  remotePeers.length === 0 ? 'grid-cols-1 h-full' :
                  remotePeers.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  
                  {/* Local Video Tile */}
                  <div className="relative aspect-video bg-ghost-900 border border-white/5 rounded-4xl overflow-hidden group cursor-pointer shadow-xl interactive-accent" onClick={() => setPinnedId('self')}>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Local Info */}
                      <div className="absolute top-6 left-6 flex gap-2">
                        <div className="px-3 py-1 glass rounded-lg text-[10px] font-black uppercase text-white tracking-[0.2em]">PRIVATE</div>
                        <div className="px-3 py-1 bg-accent-emerald text-ghost-950 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-emerald/20 animate-pulse-emerald">ACTIVE</div>
                      </div>

                      <div className="absolute bottom-8 right-8 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <VideoSettings onEffectChange={handleEffectChange} />
                      </div>
                  </div>

                  {/* Remote Participant Tiles */}
                  {remotePeers.map(peer => (
                    <div key={peer.socketId} onClick={() => setPinnedId(peer.socketId)} className="cursor-pointer">
                        <ParticipantTile 
                          stream={peer.stream} 
                          username={peer.username} 
                        />
                    </div>
                  ))}
                </div>
            )}
          </div>

          {/* Floating Stealth HUD */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40">
            <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="glass rounded-4xl flex items-center gap-1 p-2 border border-white/10 shadow-4xl"
            >
                <div className="flex items-center px-6 border-r border-white/10 gap-8">
                    <ControlOption icon={<Users size={20} />} label="LIVE" count={1 + remotePeers.length} active />
                    
                    {/* Room Identity */}
                    <div className="flex flex-col gap-0.5 min-w-[120px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Chamber</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white tracking-widest uppercase italic">{room?.name || 'Loading...'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 border-r border-white/10">
                    <button 
                        onClick={copyCode}
                        className={`p-4 rounded-3xl transition-all ${copySuccess ? 'bg-accent-emerald text-ghost-950' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                        title="Copy Chamber Code"
                    >
                        <Shield size={20} />
                    </button>
                    <button 
                        onClick={copyInvite}
                        className={`p-4 rounded-3xl transition-all bg-white/5 text-slate-400 hover:text-white hover:bg-white/10`}
                        title="Share Invite Link"
                    >
                        <Activity size={20} />
                    </button>
                    <button 
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className={`p-4 rounded-3xl transition-all ${isSidebarOpen ? 'bg-accent-cyan text-ghost-950' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                      title="Toggle Neural Chat"
                    >
                        <Settings size={20} />
                    </button>
                </div>

                <div className="px-4 pr-6">
                    <button 
                        onClick={() => router.push('/dashboard')}
                        className="px-8 py-4 bg-accent-rose/10 hover:bg-accent-rose text-accent-rose hover:text-white rounded-3xl font-black uppercase tracking-widest transition-all text-xs border border-accent-rose/20"
                    >
                        LEAVE
                    </button>
                </div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar (Chat) */}
        <AnimatePresence>
            {isSidebarOpen && (
            <motion.div 
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="lg:col-span-4 h-full"
            >
                <div className="glass-card h-full flex flex-col p-2 overflow-hidden">
                    <ChatView roomId={id as string} socket={socket} roomName={room?.name || 'Main Chamber'} />
                </div>
            </motion.div>
            )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function ControlOption({ icon, label, count, active }: any) {
    return (
        <div className="flex flex-col items-center gap-1 group cursor-pointer transition-all hover:scale-110">
            <div className={`p-4 rounded-3xl transition-all ${active ? 'bg-accent-emerald/20 text-accent-emerald shadow-lg shadow-accent-emerald/10' : 'bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10'}`}>
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{label} {count && `• ${count}`}</span>
        </div>
    )
}
