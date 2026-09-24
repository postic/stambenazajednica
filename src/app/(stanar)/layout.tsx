"use client";

import "../globals.css";
import { ReactNode, useState } from "react";

import { AuthProvider } from "@/context/AuthContext";

import Statistics from "@/components/Statistics";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import TelefoniSidebar from "@/components/TelefoniSidebar";
import AlertBanner from "@/components/AlertBanner";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";
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

          {/* ALERT BANNER */}
          <AlertBanner />

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

              {/* BREADCRUMB */}
              <div className="mb-3 text-sm text-gray-500">
                <AppBreadcrumb />
              </div>

              {/* PAGE CONTENT */}
              <Statistics />

              <div className="mt-4">
                {children}
              </div>

            </main>

            {/* RIGHT SIDEBAR DESKTOP */}
            <aside className="hidden xl:flex w-64 flex-col bg-white min-h-0 border-l border-gray-200">

              {/* SCROLL AREA */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <TelefoniSidebar />
              </div>

            </aside>

          </div>

          <Toaster
            position="top-center"
            richColors
          />

        </AuthProvider>
      </body>
    </html>
  );
}
