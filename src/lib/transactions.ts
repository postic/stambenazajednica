import { Transakcija, TransakcijaWithBalance } from "./types";

export function addRunningBalance(
  transactions: Transakcija[],
  initialBalance = 0
): TransakcijaWithBalance[] {
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  let balance = initialBalance;

  return sorted.map((t) => {
    const amount = Number(t.amount ?? 0);

    if (t.type === "uplata") {
      balance += amount;
    } else {
      balance -= amount;
    }

    return {
      ...t,
      balance,
    };
  });
}
