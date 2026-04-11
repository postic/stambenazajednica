import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { ReactNode } from "react";
import BalancePill from "@/components/BalancePill";

export const metadata = {
  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
};

export default function RootLayout({ children }: { children: ReactNode }) {

  const balance = 139299; // kasnije iz API / context-a

  return (
    <html lang="sr">
      <body>
        <RootLayoutClient>
        {children}
        <BalancePill balance={balance} />
        </RootLayoutClient>
      </body>
    </html>
  );
}
