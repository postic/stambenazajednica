'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

type Role = 'stanar' | 'upravnik' | string;

type User = {
  uid: string;
  name: string;
  mail?: string;
  role?: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 single source of truth
  const loadMe = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await res.json();

      if (res.ok && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    loadMe();
  }, []);

  const refresh = async () => {
    await loadMe();
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    setUser(null);
    router.push('/login');
    router.refresh();
  };

  /**
   * 🔥 CENTRAL ROUTING LOGIC (KEY FIX)
   * Ovo rešava "router.push ne radi" problem
   */
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    router.replace('/dashboard');
    //if (user.role === 'upravnik') {
    //  router.replace('/dashboard');
    //} else {
    //  router.replace('/transakcije');
    //}
  }, [user, loading, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
