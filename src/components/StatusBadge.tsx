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
  | "odrzana"
  | "active"
  | "pending"
  | "accepted"
  | "rejected"
  | "aktivan"
  | "pasivan"
  | "otvorena_anketa"
  | "zatvorena_anketa"
  | "uplata"
  | "isplata"
  | "vlasnik"
  | "stanar"
  | "podstanar"
  | "clan_domacinstva"
  | "archived";

type Prioritet = "nizak" | "srednji" | "visok" | "hitno";

interface StatusBadgeProps {
  status?: string | { name: string; value: string };
  prioritet?: string | { name: string; value: string };
}

/**
 * ENTERPRISE CLEAN STYLE SYSTEM
 * - flat background (no strong saturation)
 * - subtle border
 * - muted text tones
 */

const statusStyles: Record<Status, string> = {
  prijavljen: "bg-yellow-50 text-yellow-800 border-yellow-200",
  u_obradi: "bg-blue-50 text-blue-800 border-blue-200",
  na_cekanju: "bg-gray-50 text-gray-700 border-gray-200",
  resen: "bg-green-50 text-green-800 border-green-200",
  odbijen: "bg-red-50 text-red-800 border-red-200",
  zatvoren: "bg-purple-50 text-purple-800 border-purple-200",
  zakazana: "bg-indigo-50 text-indigo-800 border-indigo-200",
  otkazana: "bg-red-50 text-red-700 border-red-200",
  odrzana: "bg-green-50 text-green-700 border-green-200",

  active: "bg-blue-50 text-blue-800 border-blue-200",
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
  accepted: "bg-green-50 text-green-800 border-green-200",
  rejected: "bg-red-50 text-red-800 border-red-200",

  aktivan: "bg-green-50 text-green-800 border-green-200",
  pasivan: "bg-gray-50 text-gray-700 border-gray-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",

  otvorena_anketa: "bg-green-50 text-green-800 border-green-200",
  zatvorena_anketa: "bg-gray-50 text-gray-700 border-gray-200",

  uplata: "bg-emerald-50 text-emerald-800 border-emerald-200",
  isplata: "bg-rose-50 text-rose-800 border-rose-200",

  vlasnik: "bg-emerald-50 text-emerald-800 border-emerald-200",
  stanar: "bg-blue-50 text-blue-800 border-blue-200",
  podstanar: "bg-amber-50 text-amber-800 border-amber-200",
  clan_domacinstva: "bg-indigo-50 text-indigo-800 border-indigo-200",
};

const statusLabels: Record<Status, string> = {
  prijavljen: "prijavljen",
  u_obradi: "u obradi",
  na_cekanju: "na čekanju",
  resen: "rešen",
  odbijen: "odbijen",
  zatvoren: "zatvoren",
  zakazana: "zakazana",
  otkazana: "otkazana",
  odrzana: "održana",

  active: "aktivno",
  pending: "na razmatranju",
  accepted: "prihvaćeno",
  rejected: "odbijeno",

  aktivan: "aktivan",
  pasivan: "pasivan",
  archived: "arhivirano",

  otvorena_anketa: "otvorena",
  zatvorena_anketa: "zatvorena",

  uplata: "uplata",
  isplata: "isplata",

  vlasnik: "vlasnik",
  stanar: "stanar",
  podstanar: "podstanar",
  clan_domacinstva: "član domaćinstva",
};

const prioritetStyles: Record<Prioritet, string> = {
  nizak: "bg-blue-50 text-blue-700 border-blue-200",
  srednji: "bg-slate-50 text-slate-700 border-slate-200",
  visok: "bg-orange-50 text-orange-700 border-orange-200",
  hitno: "bg-red-50 text-red-700 border-red-200",
};

const prioritetLabels: Record<Prioritet, string> = {
  nizak: "nizak",
  srednji: "srednji",
  visok: "visok",
  hitno: "hitno",
};

function normalizeStatus(status?: string): Status | undefined {
  if (!status) return undefined;

  return status
    .toLowerCase()
    .replace(/\s/g, "_")
    .replace(/[^\w_]/g, "") as Status;
}

function normalizePrioritet(p?: string): Prioritet | undefined {
  if (!p) return undefined;

  return p.toLowerCase().replace(/[^\w]/g, "") as Prioritet;
}

export default function StatusBadge({ status, prioritet }: StatusBadgeProps) {
  const statusValue =
    typeof status === "string" ? status : status?.value;

  const prioritetValue =
    typeof prioritet === "string" ? prioritet : prioritet?.value;

  const normalizedStatus = normalizeStatus(statusValue);
  const normalizedPrioritet = normalizePrioritet(prioritetValue);

  const style = normalizedStatus
    ? statusStyles[normalizedStatus]
    : "bg-gray-50 text-gray-700 border-gray-200";

  const label = normalizedStatus
    ? statusLabels[normalizedStatus]
    : (statusValue ?? "-").toLowerCase();

  const pStyle = normalizedPrioritet
    ? prioritetStyles[normalizedPrioritet]
    : undefined;

  const pLabel = normalizedPrioritet
    ? prioritetLabels[normalizedPrioritet]
    : (prioritetValue ?? "-").toLowerCase();

  const isSednica =
    normalizedStatus === "zakazana" ||
    normalizedStatus === "otkazana" ||
    normalizedStatus === "odrzana";

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {/* STATUS */}
      {normalizedStatus && (
        <span
          className={`inline-block px-2 py-1 text-xs font-medium border ${style}`}
          title={label}
        >
          {label}
        </span>
      )}

      {/* PRIORITET */}
      {normalizedPrioritet && pStyle && !isSednica && (
        <span
          className={`inline-block px-2 py-1 text-xs font-medium border ${pStyle}`}
          title={pLabel}
        >
          {pLabel}
        </span>
      )}
    </div>
  );
}
