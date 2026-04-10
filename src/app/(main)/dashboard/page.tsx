"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Megaphone,
  ClipboardList,
  Users,
  Home,
  FileText,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();

  const items = [
    {
      title: "Otvoreni kvarovi",
      value: stats.kvarovi,
      icon: AlertTriangle,
      href: "/kvarovi",
    },
    {
      title: "Obaveštenja",
      value: stats.obavestenja,
      icon: Megaphone,
      href: "/obavestenja",
    },
    {
      title: "Aktivne ankete",
      value: stats.ankete,
      icon: ClipboardList,
      href: "/ankete",
    },
    {
      title: "Stanari",
      value: stats.stanari,
      icon: Users,
      href: "/stanari",
    },
    {
      title: "Stanovi",
      value: stats.stanovi,
      icon: Home,
      href: "/stanovi",
    },
    {
      title: "Dokumenta",
      value: 0,
      icon: FileText,
      href: "/dokumenta",
    },
  ];

  return (
    <div className="space-y-6">
      {/* TITLE */}
      <h1 className="text-base uppercase tracking-wide font-semibold text-slate-700 mb-6">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <Link key={i} href={s.href} className="block">
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{s.title}</p>

                  <p className="text-2xl font-bold">
                    {loading ? "..." : s.value}
                  </p>
                </div>

                <s.icon className="w-6 h-6 text-slate-600" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
