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
    <div className="rounded-xl border border-slate-200 bg-white p-2 md:p-3">
      <div className="mb-1 flex justify-center md:justify-start">
        {icon}
      </div>

      <div className="text-lg md:text-xl font-bold text-slate-900 text-center md:text-left">
        {value}
      </div>

      <div className="mt-1 text-[12px] md:text-[14px] uppercase font-normal tracking-normal text-gray-400 text-center md:text-left leading-tight">
        {label}
      </div>
    </div>
  );
}
