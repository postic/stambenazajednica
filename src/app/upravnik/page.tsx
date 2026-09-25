"use client";

import Link from "next/link";
import {
  Building2,
  Users,
  Bell,
  Receipt,
  ChevronRight,
} from "lucide-react";

const items = [
  {
    title: "Prostori",
    description: "Pregled stanova, stanara i PIN-ova",
    href: "/upravnik/prostori",
    icon: Building2,
  },
  {
    title: "Stanari",
    description: "Pregled stanara po stanovima",
    href: "/upravnik/stanari",
    icon: Users,
  },
  {
    title: "Obaveštenja",
    description: "Pregled i upravljanje obaveštenjima",
    href: "/upravnik/obavestenja",
    icon: Bell,
  },
  {
    title: "Transakcije",
    description: "Pregled finansijskih transakcija",
    href: "/upravnik/transakcije",
    icon: Receipt,
  },
];

export default function UpravnikPage() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Upravnik
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Upravljanje stambenom zajednicom
          </p>
        </div>

        {/* MENU */}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-gray-800">
                      {item.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
