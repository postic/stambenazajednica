type Status =
  | "prijavljen"
  | "u_obradi"
  | "na_cekanju"
  | "resen"
  | "odbijen"
  | "zatvoren";

type Prioritet = "nizak" | "srednji" | "visok" | "hitno";

interface StatusBadgeProps {
  status?: string | { name: string; value: string };
  prioritet?: string | { name: string; value: string };
}

/* STATUS */
const statusStyles: Record<Status, string> = {
  prijavljen: "bg-yellow-100 text-yellow-800",
  u_obradi: "bg-blue-100 text-blue-800",
  na_cekanju: "bg-white text-gray-800 border border-gray-200",
  resen: "bg-green-100 text-green-800",
  odbijen: "bg-red-100 text-red-800",
  zatvoren: "bg-purple-100 text-purple-800",
};

const statusLabels: Record<Status, string> = {
  prijavljen: "Prijavljen",
  u_obradi: "U obradi",
  na_cekanju: "Na čekanju",
  resen: "Rešen",
  odbijen: "Odbijen",
  zatvoren: "Zatvoren",
};

const statusIcons: Record<Status, string> = {
  prijavljen: "🟡",
  u_obradi: "🔵",
  na_cekanju: "⏳",
  resen: "✅",
  odbijen: "❌",
  zatvoren: "🔒",
};

/* PRIORITET */
const prioritetStyles: Record<Prioritet, string> = {
  nizak: "bg-gray-100 text-gray-700",
  srednji: "bg-blue-100 text-blue-700",
  visok: "bg-orange-100 text-orange-700",
  hitno: "bg-red-600 text-white animate-pulse",
};

const prioritetLabels: Record<Prioritet, string> = {
  nizak: "Nizak",
  srednji: "Srednji",
  visok: "Visok",
  hitno: "Hitno",
};

const prioritetIcons: Record<Prioritet, string> = {
  nizak: "⚪",
  srednji: "🔵",
  visok: "🟠",
  hitno: "🔴",
};

/* NORMALIZACIJA */
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
  const label = normalizedStatus ? statusLabels[normalizedStatus] : statusValue ?? "-";
  const icon = normalizedStatus ? statusIcons[normalizedStatus] : "❔";

  const pStyle = normalizedPrioritet ? prioritetStyles[normalizedPrioritet] : undefined;
  const pLabel = normalizedPrioritet ? prioritetLabels[normalizedPrioritet] : undefined;
  const pIcon = normalizedPrioritet ? prioritetIcons[normalizedPrioritet] : undefined;

  return (
    <div className="flex flex-col gap-1">
      {/* STATUS */}
      {normalizedStatus && (
        <span className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${style}`} title={label}>
          <span>{icon}</span>
          <span>{label}</span>
        </span>
      )}

      {/* PRIORITET */}
      {normalizedPrioritet && pStyle && (
        <span className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded ${pStyle}`} title={pLabel}>
          <span>{pIcon}</span>
          <span>{pLabel}</span>
        </span>
      )}
    </div>
  );
}
