"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";
import NotificationsPanel from "./NotificationsPanel";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await logout(); // koristi AuthContext logout
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 shadow flex items-center justify-between px-6">
      {/* Leva strana */}
      <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
        Stambena zajednica
      </h1>

      {/* Desna strana */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <NotificationsPanel />

        {/* Loader dok se auth učitava */}
        {loading && (
          <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
        )}

        {/* Ako korisnik NIJE logovan */}
        {!loading && !user && (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Login
          </button>
        )}

        {/* Ako korisnik JESTE logovan */}
        {!loading && user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">

              <UserAvatar
                name={user?.name}
                picture={user?.picture}
                size={40}
              />

              <span className="text-gray-900 dark:text-white text-sm font-medium">
                {user?.name}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
