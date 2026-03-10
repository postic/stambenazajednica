"use client";

import "../globals.css";
import { ReactNode, useState } from "react";

import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import AlertBanner from "@/components/AlertBanner";
import { Toaster } from "sonner";

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
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <AlertBanner />

                  <div className="flex-1 p-6 bg-gray-100">
                    {children}
                  </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <RightSidebar />

              </main>
            </div>

          </div>

          {/* TOASTER */}
          <Toaster position="top-center" richColors />

        </AuthProvider>

      </body>
    </html>
  );
}
