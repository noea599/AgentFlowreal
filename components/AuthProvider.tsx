'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('agentflow_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Simulate async auth
    await new Promise((r) => setTimeout(r, 600));
    const stored = localStorage.getItem('agentflow_user');
    const existingUser: User | null = stored ? JSON.parse(stored) : null;
    const u: User = existingUser ?? { name: email.split('@')[0], email };
    localStorage.setItem('agentflow_user', JSON.stringify(u));
    setUser(u);
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const u: User = { name, email };
    localStorage.setItem('agentflow_user', JSON.stringify(u));
    setUser(u);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('agentflow_user');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
