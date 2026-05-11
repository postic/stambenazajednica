"use client";

import "../globals.css";
import { ReactNode, useState } from "react";

import { AuthProvider } from "@/context/AuthContext";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TelefoniSidebar from "@/components/TelefoniSidebar";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
import BalancePill from "@/components/BalancePill";

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <html lang="sr">
      <body className="bg-light overflow-hidden h-dvh">

        <AuthProvider>

          {/* NAVBAR */}
          <Navbar setMobileOpen={setMobileOpen} />

          {/* MAIN LAYOUT */}
          <div className="flex h-[calc(100dvh-64px)] overflow-hidden">

            {/* LEFT SIDEBAR */}
            <aside className="shrink-0">
              <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
              />
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto bg-gray-100 p-4 min-h-0">

              <div className="mb-3 text-sm text-gray-500">
                <AppBreadcrumb />
              </div>

              {children}

            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden xl:flex w-64 flex-col bg-white min-h-0">

              {/* TOP STATIC BLOCK */}
              <div className="shrink-0 border-b border-gray-100">
                <BalancePill />
              </div>

              {/* SCROLL AREA */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <TelefoniSidebar />
              </div>

            </aside>

          </div>

          <Toaster position="top-center" richColors />

        </AuthProvider>

      </body>
    </html>
  );
}
