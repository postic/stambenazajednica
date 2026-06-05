import type {
  Transakcija,
  TransakcijaWithBalance,
} from "@/types/transakcija";

export function addRunningBalance<
  T extends Transakcija & { created: string }
>(
  transactions: T[],
  initialBalance = 0
): (T & { balance: number })[] {

  const toTime = (d?: string) => {
    if (!d) return 0;
    const t = new Date(d.replace(" ", "T")).getTime();
    return isNaN(t) ? 0 : t;
  };

  // 1. ASC za balans
  const sortedAsc = [...transactions].sort(
    (a, b) => toTime(a.created) - toTime(b.created)
  );

  let balance = initialBalance;

  const withBalanceAsc = sortedAsc.map((t) => {
    const amount = Number(t.amount ?? 0);
    const type = (t.type || "").toLowerCase();

    if (type.includes("uplata")) {
      balance += amount;
    } else {
      balance -= amount;
    }

    return {
      ...t, // ✅ KLJUČNO — čuva files i sve ostalo
      balance,
    };
  });

  return withBalanceAsc.reverse();
}

// lib/transactions.ts

export function getTransactionsWithBalance(data) {
  const sorted = [...data].sort(
    (a, b) => new Date(a.created) - new Date(b.created)
  );

  return addRunningBalance(sorted);
}
