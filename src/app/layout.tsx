import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { ReactNode } from "react";
import BalancePill from "@/components/BalancePill";
import { getBalance } from "@/lib/getBalance";

export const metadata = {
  title: "Komšija",
  description: "Aplikacija za stambenu zajednicu",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const balance = await getBalance();

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
