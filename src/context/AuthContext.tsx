"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type User = {
  uid: string;
  name: string;
  mail?: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔐 LOAD USER FROM DRUPAL SESSION
  async function refresh() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/me`,
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      setUser(data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // 🚪 LOGOUT (SESSION DESTROY)
  async function logout() {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/user/logout?_format=json`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  }

  // 🔄 INIT ON APP START
  useEffect(() => {
    refresh();
  }, []);

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
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}
