import { notFound } from "next/navigation";
import { isEmptyHtml } from "@/lib/text";
import BackButton from "@/components/BackButton";
import StatusBadge from "@/components/StatusBadge";
import { formatRSD } from "@/lib/text";
import { TransakcijaWithBalance } from "./types";
import { addRunningBalance } from "@/lib/transactions";

const NEXT_PUBLIC_DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

async function getTransakcija(id: string): Promise<TransakcijaWithBalance | null> {
  try {
    const res = await fetch(
      `${NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/node/transakcija?page[limit]=100`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const json = await res.json();

    const raw = (json.data || []).map((item: any) => ({
      id: item.id,
      title: item.attributes?.title ?? "",
      body: item.attributes.body?.value ?? "",
      amount: Number(item.attributes?.field_iznos ?? 0),
      type: item.attributes?.field_tip ?? "",
      created: item.attributes?.created ?? "",
    }));

    const withBalance = addRunningBalance(raw);

    return withBalance.find((t) => t.id === id) ?? null;

  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function TransakcijaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tx = await getTransakcija(id);

  if (!tx) notFound();

  const isIncome = tx.type === "uplata";

  return (
    <div className="max-w-4xl">

      <BackButton />

      <h1 className="text-base uppercase tracking-wide font-semibold mb-2 text-slate-700 flex items-center gap-3">
        {tx.title}
        <StatusBadge status={tx.type ?? "unknown"} />
      </h1>

      <p className="text-sm text-gray-500">
        {new Date(tx.created).toLocaleDateString("sr-RS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div className="border-t my-8" />

      <div className="space-y-4 text-sm font-mono">

        <div className="flex justify-between">
          <span className="text-gray-500">Tip:</span>
          <span className="text-gray-800">{tx.type}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Iznos:</span>
          <span className="text-gray-800 tabular-nums">
            {formatRSD(tx.amount)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Stanje:</span>
          <span className="text-gray-800 tabular-nums">
            {formatRSD(tx.balance ?? 0)}
          </span>
        </div>

      </div>

      {!isEmptyHtml(tx.body) && <div className="border-t my-8" />}

      {!isEmptyHtml(tx.body) && (
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: tx.body }}
        />
      )}

    </div>
  );
}
