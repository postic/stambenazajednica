import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
}

export default function StatCard({
  icon,
  value,
  label,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2">
        {icon}
      </div>

      <div className="text-2xl font-bold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-gray-400 text-[11px] uppercase font-normal tracking-normal">
        {label}
      </div>
    </div>
  );
}
