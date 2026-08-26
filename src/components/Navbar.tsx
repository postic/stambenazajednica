"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import UserAvatar from "@/components/UserAvatar";
import AppLogo from "@/components/AppLogo";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Sun,
  Moon,
  Menu,
  Download,
  Home,
  Bell,
  Wrench,
  LogOut,
} from "lucide-react";

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
    await deferredPrompt.userChoice;

    setDeferredPrompt(null);
  };

  const handleLogout = async () => {
    try {
      await logout();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 flex items-center justify-between px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 shadow-sm">

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}
      <div className="flex items-center gap-3 md:ml-4 lg:ml-6">

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 -ml-[3px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={18} />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition"
        >
          <div className="scale-125 md:scale-150 ml-[10px] md:ml-0">
            <AppLogo />
          </div>
        </Link>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}
      <div className="flex items-center gap-3 md:gap-4">

        {/* 📲 Install App */}
        {deferredPrompt && (
          <button
            onClick={handleInstallApp}
            className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-white hover:bg-blue-700 transition"
          >
            <Download size={18} />

            <span className="hidden md:block text-sm">
              Install
            </span>
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
        )}

        {/* =================================================
            NOT LOGGED IN
        ================================================= */}
        {!loading && !user && (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Login
          </button>
        )}

        {/* =================================================
            LOGGED USER
        ================================================= */}
        {!loading && user && (
          <DropdownMenu>

            {/* User avatar + name */}
            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none">
              <UserAvatar
                name={user?.name}
                picture={user?.picture}
                size={40}
              />

              <span className="hidden md:block text-gray-900 dark:text-white text-sm font-medium">
                {user?.name}
              </span>
            </DropdownMenuTrigger>

            {/* User menu */}
            <DropdownMenuContent
              align="end"
              className="w-56"
            >

              {/* Moj prostor */}
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Moj prostor</span>
              </DropdownMenuItem>

              {/* Moja obaveštenja */}
              <DropdownMenuItem
                onClick={() => router.push("/moja-obavestenja")}
                className="cursor-pointer"
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Moja obaveštenja</span>
              </DropdownMenuItem>

              {/* Moji kvarovi */}
              <DropdownMenuItem
                onClick={() => router.push("/moji-kvarovi")}
                className="cursor-pointer"
              >
                <Wrench className="mr-2 h-4 w-4" />
                <span>Moji kvarovi</span>
              </DropdownMenuItem>

              {/* Separator */}
              <DropdownMenuSeparator />

              {/* Logout */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Odjavi se</span>
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>
        )}

      </div>
    </header>
  );
}
