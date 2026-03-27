// GhostRoom Obsidian/Emerald Theme — ported from web
export const Colors = {
  ghost: {
    950: '#0a0a0f',
    900: '#111118',
    800: '#1a1a24',
    700: '#2a2a38',
  },
  accent: {
    emerald: '#10b981',
    cyan: '#06b6d4',
    rose: '#f43f5e',
  },
  slate: {
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
  },
  white: '#ffffff',
  transparent: 'transparent',
};

// Use your Mac's LAN IP so the phone can reach the backend
// Find yours with: ipconfig getifaddr en0
export const API_BASE_URL = 'http://192.168.1.123:4000';
export const REALTIME_URL = 'http://192.168.1.123:4004';
