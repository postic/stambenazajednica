import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {

  metadataBase: new URL("https://stambenazajednica.vercel.app/"),

  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-180.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Komšija",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
