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

import { Sun, Moon, Menu } from "lucide-react";

interface NavbarProps {
  setMobileOpen: (open: boolean) => void;
}

export default function Navbar({ setMobileOpen }: NavbarProps) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);

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

        {/* Mobile sidebar button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={22} />
        </button>

        {/* Title */}
        <h1 className="font-bold text-lg md:text-2xl text-gray-900 dark:text-white">
          Stambena zajednica
        </h1>

      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* Dark mode toggle */}
        <button
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <NotificationsPanel />

        {/* Loading skeleton */}
        {loading && (
          <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
        )}

        {/* Not logged */}
        {!loading && !user && (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
