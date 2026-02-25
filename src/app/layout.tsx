import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'Komšija',
  description: 'Aplikacija za stambenu zajednicu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body className="h-screen bg-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
