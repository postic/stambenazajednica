import "../globals.css";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import AlertBanner from "@/components/AlertBanner";
import { Toaster } from "sonner";

export const metadata = {
  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr">
      <body className="bg-gray-100 min-h-screen">
        <AuthProvider>
          {/* Navbar */}
          <Navbar />

          {/* Glavni container sa sidebarovima i sadržajem */}
          <div className="flex min-h-[calc(100vh-64px)]"> {/* 64px = visina navbar-a */}

            {/* Levi sidebar */}
            <Sidebar />

            {/* Glavni content */}
            <main className="flex-1 flex flex-col">
              {/* Alert banner full width */}
              <div className="w-full">
                <AlertBanner />
              </div>

              {/* Stranica ide ovde */}
              <div className="flex-1 p-6 bg-gray-100">
                {children}
              </div>
            </main>

            {/* Desni sidebar */}
            <RightSidebar />
          </div>

          {/* Toast notifikacije */}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
