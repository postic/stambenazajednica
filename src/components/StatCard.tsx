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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <div className="flex justify-center md:justify-start">
          {icon}
        </div>

        <div className="text-sm md:text-xl font-bold text-slate-900 text-center md:text-left">
  {value}
</div>

        <div className="text-[12px] md:text-[14px] uppercase font-normal tracking-normal text-gray-400 text-center md:text-left leading-tight">
          {label}
        </div>
      </div>
    </div>
  );
}
