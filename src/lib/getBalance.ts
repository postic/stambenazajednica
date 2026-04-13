type Transakcija = {
  id: string;
  amount: number;
  type: "uplata" | "isplata";
};

export async function getTransactions(): Promise<Transakcija[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/transakcija`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("API ERROR:", res.status);
      return [];
    }

    const data = await res.json();

    return (data?.data ?? []).map((item: any) => ({
      id: item.id,
      amount: Number(item.attributes.field_iznos),
      type: item.attributes.field_tip,
    }));
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return [];
  }
}

export async function getBalance() {
  const transactions = await getTransactions();

  return transactions.reduce((sum, t) => {
    return t.type === "uplata"
      ? sum + t.amount
      : sum - t.amount;
  }, 0);
}
