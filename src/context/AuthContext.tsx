"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  uid: number;
  name: string;
  mail: string;
};

type AuthContextType = {
  user: User | null;
  login: (name: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.logged_in) {
          setUser(data);
        }
      });
  }, []);

  async function login(name: string, pass: string) {

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        pass,
      }),
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();

    setUser(data);

    return true;
  }

  async function logout() {

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
