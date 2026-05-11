import { Building2, Users } from "lucide-react";

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {/* BUILDING */}
        <Building2 className="w-6 h-6 text-slate-800 dark:text-white" />

        {/* PEOPLE / COMMUNITY */}
        <Users className="w-3 h-3 text-sky-500 dark:text-sky-400 absolute -bottom-1 -right-1" />
      </div>

      <span className="font-semibold tracking-wide text-slate-800 dark:text-white">
        Stambena zajednica
      </span>
    </div>
  );
}
