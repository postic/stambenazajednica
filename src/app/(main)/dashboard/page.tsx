"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Megaphone,
  ClipboardList,
  Users,
  Home,
  Wallet,
  FileText,
  CircleEllipsis,
  CalendarCheck,
  Grid,
  Phone
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function DashboardPage() {
  const { stats, loading } = useDashboardStats();

  const items = [
    {
      title: "Transakcije",
      value: stats.transakcije,
      icon: Wallet,
      href: "/transakcije",
    },
    {
      title: "Ankete",
      value: stats.ankete,
      icon: ClipboardList,
      href: "/ankete",
    },
    {
      title: "Kvarovi",
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
      title: "Sednice",
      value: stats.sednice,
      icon: CalendarCheck,
      href: "/sednice",
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
    {
      title: "Telefoni",
      value: stats.telefoni,
      icon: Phone,
      href: "/telefoni",
    },
  ];

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div data-field>
          <h1 className="text-xl font-semibold">
            Kontrolna tabla
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sve važne informacije na jednom mestu</p>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <Card key={i} className="transition">
            <CardContent className="flex items-center justify-between">
              <div>
                <Link
                  href={s.href}
                  className="text-sm text-slate-500 hover:text-slate-900 transition"
                >
                  {s.title}
                </Link>

                <p className="text-2xl font-bold">
                  {loading ? "..." : s.value}
                </p>
              </div>

              <s.icon className="w-6 h-6 text-slate-600" />
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
