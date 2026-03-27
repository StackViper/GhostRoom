import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStoredUser, login as apiLogin, signup as apiSignup, logout as apiLogout, isAuthenticated } from '../services/api';

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authed = await isAuthenticated();
      if (authed) {
        const u = await getStoredUser();
        setUser(u);
        setIsLoggedIn(true);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
    setIsLoggedIn(true);
  };

  const signup = async (email: string, password: string, username: string, fullName: string) => {
    await apiSignup(email, password, username, fullName);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
