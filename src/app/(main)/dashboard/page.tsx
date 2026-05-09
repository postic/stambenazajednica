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
  CalendarCheck,
  CircleEllipsis,
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
      title: "Dokumenti",
      value: 0,
      icon: FileText,
      href: "/dokumenti",
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
            Brz pristup statistikama, obaveštenjima, kvarovima i finansijama.</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((s, i) => (
          <Card
            key={i}
            className="border border-slate-200 rounded-xl bg-slate-50 shadow-none"
          >
            <CardContent className="flex items-center justify-between px-4">
              <div className="space-y-0.5">
                <Link
                  href={s.href}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  {s.title}
                </Link>

                <p className="text-2xl font-bold text-slate-900 leading-none">
                  {loading ? "..." : s.value}
                </p>
              </div>

              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-slate-200">
                <s.icon className="w-5 h-5 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
