"use client";

import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

type Props = {
  balance: number;
};

export default function BalancePill({ balance }: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/transakcije")}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white shadow-lg"
    >
      <Wallet className="w-4 h-4" />
      <span>{balance.toLocaleString("sr-RS")} RSD</span>
    </button>
  );
}
