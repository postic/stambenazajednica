"use client";

import "../globals.css";
import { ReactNode, useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TelefoniSidebar from "@/components/TelefoniSidebar";
import AlertBanner from "@/components/AlertBanner";
import { Toaster } from "sonner";
import BalancePill from "@/components/BalancePill";
import AllowNotifications from "@/components/AllowNotifications";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <html lang="sr">
      <body className="bg-gray-100 h-screen overflow-hidden">
        <AuthProvider>
          <div className="flex h-screen">

            {/* LEFT SIDEBAR */}
            <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* MAIN AREA */}
            <div className="flex flex-1 flex-col">

              {/* NAVBAR */}
              <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
                <Navbar setMobileOpen={setMobileOpen} />
              </div>

              {/* MAIN CONTENT + RIGHT SIDEBAR */}
              <main className="flex flex-1 overflow-hidden">

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col overflow-y-auto p-6">

                  {/* BREADCRUMB */}
                  <div className="mb-2 text-sm text-gray-500">
                    <AppBreadcrumb />
                  </div>
                  {children}

                </div>

                {/* RIGHT SIDEBAR */}
                <div className="hidden lg:block">
                  <TelefoniSidebar />
                </div>

                {/* BADGE */}
                <div className="absolute right-4 top-3">
                  <BalancePill />
                </div>

                {/* <AllowNotifications /> */}

              </main>
            </div>

          </div>

          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
