"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { useRouter } from "next/navigation";

type Role = "stanar" | "upravnik" | string;

type User = {
  uid: string;
  name: string;
  display_name?: string;
  mail?: string;
  roles: Role[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 🔐 AUTO LOAD USER (ON APP START)
   */
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  /**
   * 🔐 LOGIN - samo refresh /me (token već dolazi iz login API-ja)
   */
  const login = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    }
  };

  /**
   * 🚪 LOGOUT
   */
  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {}

    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 🔥 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
