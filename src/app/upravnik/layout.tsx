"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Building2,
  Home,
  KeyRound,
  Loader2,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";

import { toast, Toaster } from "sonner";

interface User {
  uid?: number | string;
  name?: string;
  roles?: string[];
}

export default function UpravnikLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/upravnik/login";

  useEffect(() => {
    async function checkAuth() {
      // Login stranica ne zahteva autentikaciju
      if (isLoginPage) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          toast.error("Morate biti prijavljeni kao upravnik.");
          router.replace("/upravnik/login");
          return;
        }

        const data = await res.json();
        const user: User | undefined = data?.user;

        if (!user?.roles?.includes("upravnik")) {
          toast.error("Nemate ovlašćenje za pristup.");
          router.replace("/upravnik/login");
          return;
        }

        setAuthorized(true);
      } catch (error) {
        console.error("Upravnik auth error:", error);

        toast.error("Greška pri proveri prijave.");
        router.replace("/upravnik/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, isLoginPage]);

  /*
   * LOGIN STRANICA
   */
  if (isLoginPage) {
    return (
      <>
        <Toaster position="top-center" richColors />
        {children}
      </>
    );
  }

  /*
   * LOADING
   */
  if (loading) {
    return (
      <>
        <Toaster position="top-center" richColors />

        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  /*
   * NIJE AUTORIZOVAN
   */
  if (!authorized) {
    return <Toaster position="top-center" richColors />;
  }

  const menuItems = [
    {
      href: "/upravnik",
      label: "Pregled",
      icon: Home,
    },
    {
      href: "/upravnik/prostori",
      label: "Prostori",
      icon: Building2,
    },
    {
      href: "/upravnik/stanari",
      label: "Stanari",
      icon: Users,
    },
    {
      href: "/upravnik/pinovi",
      label: "PIN-ovi",
      icon: KeyRound,
    },
  ];

  function isActive(href: string) {
    if (href === "/upravnik") {
      return pathname === "/upravnik";
    }

    return pathname.startsWith(href);
  }

  async function handleLogout() {
    try {
      await fetch("/api/upravnik/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Upravnik logout error:", error);
    } finally {
      router.replace("/upravnik/login");
      router.refresh();
    }
  }

  return (
    <>
      <Toaster position="top-center" richColors />

      <div className="min-h-screen bg-gray-100">
        {/* NAVBAR */}
        <header className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-white">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            {/* LEVA STRANA */}
            <div className="flex items-center gap-3">
              {/* MOBILE MENU */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
                aria-label="Otvori meni"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* LOGO / NAZIV */}
              <Link
                href="/upravnik"
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-white">
                  <Building2 className="h-5 w-5" />
                </div>

                <div className="leading-tight">
                  <div className="font-semibold text-gray-800">
                    Komšija
                  </div>

                  <div className="text-xs text-gray-500">
                    Upravnik
                  </div>
                </div>
              </Link>
            </div>

            {/* DESKTOP USER / ODJAVA */}
            <div className="hidden items-center gap-3 lg:flex">
              <span className="text-sm text-gray-500">
                Upravnik
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Odjava
              </button>
            </div>
          </div>
        </header>

        {/* DESKTOP SIDEBAR */}
        <aside className="fixed bottom-0 left-0 top-16 hidden w-60 border-r bg-white lg:block">
          <nav className="flex flex-col gap-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* ODJAVA */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Odjava</span>
            </button>
          </div>
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-[60] bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* MOBILE SIDEBAR */}
        <aside
          className={`fixed bottom-0 left-0 top-0 z-[70] w-72 bg-white shadow-xl transition-transform duration-200 lg:hidden ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          {/* MOBILE SIDEBAR HEADER */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <Link
              href="/upravnik"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-white">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="leading-tight">
                <div className="font-semibold text-gray-800">
                  Komšija
                </div>

                <div className="text-xs text-gray-500">
                  Upravnik
                </div>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Zatvori meni"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* MOBILE MENU */}
          <nav className="flex flex-col gap-1 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-gray-800 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* MOBILE ODJAVA */}
          <div className="absolute bottom-4 left-4 right-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span>Odjava</span>
            </button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="pt-16 lg:pl-60">
          <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
