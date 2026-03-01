import "../globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import AlertBanner from "@/components/AlertBanner";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr">
      <body className="bg-gray-100 h-screen overflow-hidden">
        <AuthProvider>
          {/* Glavni layout */}
          <div className="flex h-screen">
            {/* Levi sidebar - ide do vrha */}
            <Sidebar />
            {/* Centralni deo (navbar + content) */}
            <div className="flex-1 flex flex-col">
              {/* Navbar sada više nije iznad layouta */}
              <div className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <Navbar />
              </div>
              <main className="flex-1 flex overflow-hidden">
                {/* Glavni content */}
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <AlertBanner />
                  <div className="flex-1 p-6 bg-gray-100">
                    {children}
                  </div>
                </div>
                {/* Desni sidebar */}
                <RightSidebar />
              </main>
            </div>
          </div>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
