"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  Users,
  Settings,
  LayoutDashboard,
  Wrench,
  Megaphone,
  CalendarCheck,
  FileText,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuSections = [
    {
      title: "GLAVNO",
      items: [{ title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
    },
    {
      title: "ZGRADA",
      items: [
        { title: "Stanari", icon: Users, submenu: [
            { title: "Lista stanara", href: "/dashboard/users/list" },
            { title: "Dodaj stanara", href: "/dashboard/users/add" },
          ]
        },
        { title: "Kvarovi", icon: Wrench, href: "/kvarovi", badge: 3 },
        { title: "Obaveštenja", icon: Megaphone, href: "/obavestenja", badge: 2 },
        { title: "Sednice", icon: CalendarCheck, href: "/sednice" },
      ],
    },
    {
      title: "DOKUMENTI",
      items: [
        { title: "Dokumenti", icon: FileText, badge: 5, submenu: [
            { title: "Zapisnici", href: "/dokumenti/zapisnici" },
            { title: "Odluke", href: "/dokumenti/odluke" },
            { title: "Ponude", href: "/dokumenti/ponude" },
            { title: "Ugovori", href: "/dokumenti/ugovori" },
            { title: "Finansijski izveštaji", href: "/dokumenti/finansijski-izvestaji" },
            { title: "Ostalo", href: "/dokumenti/ostalo" },
          ]
        },
      ],
    },
    {
      title: "SISTEM",
      items: [{ title: "Settings", icon: Settings, href: "/dashboard/settings" }],
    },
  ];

  useEffect(() => {
    menuSections.forEach((section) =>
      section.items.forEach((item) => {
        if (item.submenu) {
          const activeSub = item.submenu.find((sub) => pathname.startsWith(sub.href));
          if (activeSub) setOpenMenu(item.title);
        }
      })
    );
  }, [pathname]);

  const itemBase = "w-full flex items-center p-4 rounded-lg transition hover:bg-slate-700";

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-screen bg-slate-800 text-white border-r border-slate-700/50 flex flex-col
          transition-transform duration-300 ease-in-out
          ${collapsed ? "md:w-20" : "md:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className={`flex items-center p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && <span className="text-2xl font-bold">{user?.name}</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-2 hover:bg-slate-700 rounded-lg transition"><Menu /></button>
        </div>

        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && <div className="px-4 mb-2 text-xs font-semibold text-slate-400 tracking-wider">{section.title}</div>}
              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isOpen = openMenu === item.title;
                  const isParentActive = item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href));

                  return (
                    <li key={item.title}>
                      {item.submenu ? (
                        <>
                          <button onClick={() => setOpenMenu(isOpen ? null : item.title)} className={`${itemBase} ${collapsed ? "justify-center" : "justify-between"} ${isParentActive ? "bg-slate-700" : ""}`}>
                            <div className="flex items-center gap-3"><Icon className="shrink-0" />{!collapsed && <span>{item.title}</span>}</div>
                            {!collapsed && <span className="text-xl w-6 text-center font-bold">{isOpen ? "−" : "+"}</span>}
                          </button>
                          {!collapsed && isOpen && (
                            <ul className="ml-6 mt-1 space-y-1">
                              {item.submenu.map((sub) => (
                                <li key={sub.href}>
                                  <Link href={sub.href} onClick={() => setMobileOpen(false)} className={`block p-2 rounded-lg hover:bg-slate-700 ${pathname === sub.href ? "bg-slate-700" : ""}`}>{sub.title}</Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <Link href={item.href} onClick={() => setMobileOpen(false)} className={`${itemBase} ${collapsed ? "justify-center" : "gap-3"} ${pathname === item.href ? "bg-slate-700" : ""}`}>
                          <Icon className="shrink-0" />
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
