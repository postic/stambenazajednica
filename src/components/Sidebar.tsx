"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import InstallBanner from "@/components/InstallBanner";
import {
  Menu,
  Users,
  Wrench,
  Megaphone,
  CalendarCheck,
  FileText,
  Vote,
  ChevronDown,
  Wallet,
  Grid,
  Building
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface SubItem {
  title: string;
  href: string;
  badge?: number;
}

interface SidebarItem {
  title: string;
  href?: string;
  icon?: any;
  badge?: number;
  submenu?: SubItem[];
}

interface MenuSection {
  title: string;
  items: SidebarItem[];
}

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuSections: MenuSection[] = [
    {
      title: "ZGRADA",
      items: [
        { title: "Transakcije", icon: Wallet, href: "/transakcije" },
        { title: "Ankete", icon: Vote, href: "/ankete" },
        { title: "Kvarovi", icon: Wrench, href: "/kvarovi" },
        { title: "Obaveštenja", icon: Megaphone, href: "/obavestenja" },
        { title: "Sednice", icon: CalendarCheck, href: "/sednice" },
        { title: "Stanovi", icon: Building, href: "/stanovi" },
        { title: "Stanari", icon: Users, href: "/stanari" },
      ],
    },
    {
      title: "DOKUMENTI",
      items: [
        {
          title: "Dokumenti",
          icon: FileText,
          submenu: [
            { title: "Finansijski izveštaji", href: "/dokumenti/finansijski-izvestaji" },
            { title: "Odluke", href: "/dokumenti/odluke" },
            { title: "Ponude", href: "/dokumenti/ponude" },
            { title: "Ugovori", href: "/dokumenti/ugovori" },
            { title: "Ostalo", href: "/dokumenti/ostalo" },
          ],
        },
      ],
    },
    {
      title: "OSTALO",
      items: [
        {
          title: "Ostalo",
          icon: Grid,
          submenu: [
            { title: "Telefoni", href: "/telefoni" },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    menuSections.forEach((section) =>
      section.items.forEach((item) => {
        if (item.submenu) {
          const activeSub = item.submenu.find((sub) =>
            pathname.startsWith(sub.href)
          );
          if (activeSub) setOpenMenu(item.title);
        }
      })
    );
  }, [pathname]);

  const itemBase =
    "group relative w-full flex items-center px-3 py-1 text-[15px] transition";

  const iconClass = "w-5 h-5 shrink-0 text-slate-400";

  const Badge = ({ value }: { value?: number }) =>
    value !== undefined ? (
      <span className="ml-auto text-[11px] bg-slate-600 text-white px-1.5 py-0.5">
        {value}
      </span>
    ) : null;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-screen
          bg-slate-900 text-white border-r border-slate-800
          flex flex-col
          transition-all duration-300
          ${collapsed ? "md:w-16" : "md:w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* HEADER */}
        <div className={`flex items-center p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <span className="text-lg font-semibold truncate text-slate-200">
              {user?.name}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 mt-2 overflow-y-auto">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <div className="px-4 mb-2 text-xs font-semibold text-slate-500 tracking-wider">
                  {section.title}
                </div>
              )}

              <ul className="space-y-1 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isOpen = openMenu === item.title;
                  const isParentActive =
                    item.submenu &&
                    item.submenu.some((sub) =>
                      pathname.startsWith(sub.href)
                    );

                  return (
                    <li key={item.title}>
                      {item.submenu ? (
                        <>
                          <button
                            onClick={() => setOpenMenu(isOpen ? null : item.title)}
                            className={`${itemBase} ${
                              isParentActive ? "bg-slate-800" : "hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {Icon && <Icon className={iconClass} />}
                              {!collapsed && <span>{item.title}</span>}
                            </div>

                            {!collapsed && (
                              <ChevronDown
                                className={`w-4 h-4 ml-auto transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isOpen ? "max-h-96" : "max-h-0"
                            }`}
                          >
                            {!collapsed && (
                              <ul className="mt-1 border-l border-slate-800 ml-6 pl-3 space-y-1">
                                {item.submenu.map((sub) => (
                                  <li key={sub.href}>
                                    <Link
                                      href={sub.href}
                                      onClick={() => {
                                        setMobileOpen(false);
                                        setOpenMenu(null);
                                      }}
                                      className={`flex items-center px-3 py-1 text-[14px] ${
                                        pathname === sub.href
                                          ? "text-white border-l-2 border-red-500 bg-slate-800"
                                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                                      }`}
                                    >
                                      <span className="flex-1">{sub.title}</span>
                                      {sub.badge !== undefined && <Badge value={sub.badge} />}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          onClick={() => {
                            setMobileOpen(false);
                            setOpenMenu(null);
                          }}
                          className={`${itemBase} ${
                            pathname === item.href
                              ? "bg-slate-800 text-white"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          {Icon && <Icon className={iconClass} />}
                          {!collapsed && <span className="ml-3 flex-1">{item.title}</span>}
                          {!collapsed && item.badge !== undefined && <Badge value={item.badge} />}
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
