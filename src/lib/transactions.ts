import type {
  Transakcija,
  TransakcijaWithBalance,
} from "@/types/transakcija";


export function addRunningBalance(
  transactions: Transakcija[],
  initialBalance = 0
): TransakcijaWithBalance[] {

  const toTime = (d?: string) => {
    if (!d) return 0;
    const t = new Date(d.replace(" ", "T")).getTime();
    return isNaN(t) ? 0 : t;
  };

  // 1. ASC za ispravan balans
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

    return { ...t, balance };
  });

  // 2. vrati DESC za UI
  return withBalanceAsc.reverse();
}
