import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/Colors';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('ghost_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const login = async (email: string, password: string) => {
  const res = await api.post('/api/auth/login', { email, password });
  const { internalToken, user } = res.data;
  await AsyncStorage.setItem('ghost_auth_token', internalToken);
  await AsyncStorage.setItem('user', JSON.stringify(user));
  return user;
};

export const signup = async (email: string, password: string, username: string, fullName: string) => {
  const res = await api.post('/api/auth/signup', { email, password, username, fullName });
  return res.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('ghost_auth_token');
  await AsyncStorage.removeItem('user');
};

export const getStoredUser = async () => {
  const userStr = await AsyncStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('ghost_auth_token');
  return !!token;
};

// --- Rooms ---
export const getMyRooms = async () => {
  const res = await api.get('/api/rooms/my-rooms');
  return res.data;
};

export const createRoom = async (name: string) => {
  const res = await api.post('/api/rooms/create', { name });
  return res.data;
};

export const joinRoom = async (roomId: string, token?: string) => {
  const res = await api.post('/api/rooms/join', { roomId, token });
  return res.data;
};

export const getRoomDetails = async (roomId: string) => {
  const res = await api.get(`/api/rooms/${roomId}`);
  return res.data;
};

export const lookupInvite = async (token: string) => {
  const res = await api.get(`/api/rooms/invite-lookup/${token}`);
  return res.data;
};

export default api;
