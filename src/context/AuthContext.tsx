"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  uid: string;
  name: string;
  picture?: string;
  role?: string;
};

type LoginPayload = {
  identifier: string;
  pin: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (data: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me", {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data.user ?? null);
    } catch (err) {
      console.error("Auth error:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  // ✅ LOGIN (PIN → JWT cookie)
  const login = async (data: LoginPayload): Promise<boolean> => {
    try {
      const res = await fetch("/api/pin-login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        return false;
      }

      // Nakon login-a povuci user-a iz /api/me
      await fetchUser();

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  };

  // 🔄 REFRESH USER
  const refresh = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
