"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import NotificationsPanel from "./NotificationsPanel";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Sun, Moon, Menu, Download } from "lucide-react";

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // 🌙 Dark mode
  useEffect(() => {
    const root = window.document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // 📲 PWA install detection
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    //console.log("PWA install result:", choice);

    setDeferredPrompt(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 shadow flex items-center justify-between px-4 md:px-6">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* Mobile sidebar */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        <h1 className="font-bold text-lg md:text-2xl text-gray-900 dark:text-white">
          Stambena zajednica
        </h1>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* 📲 Install App (PWA) */}
        {deferredPrompt && (
          <button
            onClick={handleInstallApp}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-blue-700 transition"
            title="Install App"
          >
            <Download size={18} />
            <span className="hidden md:block text-sm">Install</span>
          </button>
        )}

{/*
  <button
    className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
    onClick={() => setDarkMode(!darkMode)}
    title="Toggle Dark Mode"
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>

  <NotificationsPanel />
*/}

        {/* Loading */}
        {loading && (
          <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
        )}

        {/* Not logged */}
        {!loading && !user && (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Login
          </button>
        )}

        {/* Logged user */}
        {!loading && user && (
          <DropdownMenu>

            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer">

              <UserAvatar
                name={user?.name}
                picture={user?.picture}
                size={40}
              />

              <span className="hidden md:block text-gray-900 dark:text-white text-sm font-medium">
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
