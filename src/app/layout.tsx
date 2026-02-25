import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className="h-screen bg-background">
        <AuthProvider>
          {children}
        </AuthProvider>

        {/* 🔥 OVO JE KLJUČNO */}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
