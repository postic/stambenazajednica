// src/components/StatusBadge.tsx

type Status =
  | "prijavljen"
  | "u_obradi"
  | "na_cekanju"
  | "resen"
  | "odbijen"
  | "zatvoren"
  | "zakazana"
  | "otkazana"
  | "odrzana";

type Prioritet = "nizak" | "srednji" | "visok" | "hitno";

interface StatusBadgeProps {
  status?: string | { name: string; value: string };
  prioritet?: string | { name: string; value: string };
}

const statusStyles: Record<Status, string> = {
  prijavljen: "bg-yellow-100 text-yellow-800",
  u_obradi: "bg-blue-100 text-blue-800",
  na_cekanju: "bg-white text-gray-800 border border-gray-200",
  resen: "bg-green-100 text-green-800",
  odbijen: "bg-red-100 text-red-800",
  zatvoren: "bg-purple-100 text-purple-800",
  zakazana: "bg-indigo-100 text-indigo-800",
  otkazana: "bg-red-200 text-red-900",
  odrzana: "bg-green-200 text-green-900",
};

const statusLabels: Record<Status, string> = {
  prijavljen: "prijavljen",
  u_obradi: "u obradi",
  na_cekanju: "na čekanju",
  resen: "resen",
  odbijen: "odbijen",
  zatvoren: "zatvoren",
  zakazana: "zakazana",
  otkazana: "otkazana",
  odrzana: "odrzana",
};

const prioritetStyles: Record<Prioritet, string> = {
  nizak: "bg-gray-100 text-gray-700",
  srednji: "bg-blue-100 text-blue-700",
  visok: "bg-orange-100 text-orange-700",
  hitno: "bg-red-600 text-white",
};

const prioritetLabels: Record<Prioritet, string> = {
  nizak: "nizak",
  srednji: "srednji",
  visok: "visok",
  hitno: "hitno",
};

function normalizeStatus(status?: string): Status | undefined {
  if (!status) return undefined;
  return status.toLowerCase().replace(/\s/g, "_").replace(/[^\w_]/g, "") as Status;
}

function normalizePrioritet(p?: string): Prioritet | undefined {
  if (!p) return undefined;
  return p.toLowerCase().replace(/[^\w]/g, "") as Prioritet;
}

export default function StatusBadge({ status, prioritet }: StatusBadgeProps) {
  const statusValue = typeof status === "string" ? status : (status as any)?.value;
  const prioritetValue = typeof prioritet === "string" ? prioritet : (prioritet as any)?.value;

  const normalizedStatus = normalizeStatus(statusValue);
  const normalizedPrioritet = normalizePrioritet(prioritetValue);

  const style = normalizedStatus ? statusStyles[normalizedStatus] : "bg-gray-100 text-gray-800";
  const label = normalizedStatus ? statusLabels[normalizedStatus] : (statusValue ?? "-").toLowerCase();
  const pStyle = normalizedPrioritet ? prioritetStyles[normalizedPrioritet] : undefined;
  const pLabel = normalizedPrioritet ? prioritetLabels[normalizedPrioritet] : (prioritetValue ?? "-").toLowerCase();

  const isSednica =
    normalizedStatus === "zakazana" ||
    normalizedStatus === "otkazana" ||
    normalizedStatus === "odrzana";

  return (
    <div className="flex flex-col gap-1 w-max">
      {/* STATUS */}
      {normalizedStatus && (
        <span
          className={`inline-block lowercase px-4 py-1 rounded-full ${style}`}
          title={label}
        >
          {label}
        </span>
      )}

      {/* PRIORITET */}
      {normalizedPrioritet && pStyle && !isSednica && (
        <span
          className={`inline-block lowercase px-4 py-1 rounded-full ${pStyle}`}
          title={pLabel}
        >
          {pLabel}
        </span>
      )}
    </div>
  );
}
