import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { ReactNode } from "react";

export const metadata = {
  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
