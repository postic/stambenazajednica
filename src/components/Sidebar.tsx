"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  Users,
  Wrench,
  Megaphone,
  CalendarCheck,
  FileText,
  Vote,
  ChevronDown,
  Wallet,
  Grid,
  Building,
  Menu,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface SubItem {
  title: string;
  href: string;
}

interface SidebarItem {
  title: string;
  href?: string;
  icon?: any;
  submenu?: SubItem[];
}

interface MenuSection {
  title: string;
  items: SidebarItem[];
}

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
          submenu: [{ title: "Telefoni", href: "/telefoni" }],
        },
      ],
    },
  ];

  const itemBase =
    "group flex items-center justify-start w-full px-4 py-3 text-[15px] rounded-xl transition";

  const iconClass =
    "w-5 h-5 shrink-0 text-slate-500 group-hover:text-white transition-colors";

  const itemClass = (active: boolean) =>
    `${itemBase} ${
      active
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-[100dvh]
          bg-[#0B1120]
          flex flex-col
          transition-all duration-300

          ${collapsed ? "w-20" : "w-72"}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center border-b border-slate-800 px-3">
          <button
            onClick={() => {
              if (isMobile) setMobileOpen(!mobileOpen);
              else setCollapsed(!collapsed);
            }}
            className="p-2 ml-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">

              {!collapsed && (
                <div className="px-3 mb-3 text-[11px] font-semibold uppercase text-slate-500">
                  {section.title}
                </div>
              )}

              <ul className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  const isOpen = openMenu === item.title;

                  const hasSub = item.submenu;

                  return (
                    <li key={item.title}>

                      {/* PARENT */}
                      {hasSub ? (
                        <button
                          onClick={() =>
                            setOpenMenu(isOpen ? null : item.title)
                          }
                          className={itemClass(false)}
                        >
                          {Icon && <Icon className={iconClass} />}

                          {!collapsed && (
                            <>
                              <span className="ml-3 flex-1 text-left">
                                {item.title}
                              </span>

                              <ChevronDown
                                className={`w-4 h-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </>
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className={itemClass(isActive)}
                          onClick={() => setMobileOpen(false)}
                        >
                          {Icon && <Icon className={iconClass} />}

                          {!collapsed && (
                            <span className="ml-3 flex-1 text-left">
                              {item.title}
                            </span>
                          )}
                        </Link>
                      )}

                      {/* SUBMENU (only expanded mode) */}
                      {hasSub && !collapsed && (
                        <div
                          className={`overflow-hidden transition-all ${
                            isOpen ? "max-h-96 mt-2" : "max-h-0"
                          }`}
                        >
                          <ul className="ml-6 pl-3 border-l border-slate-800 space-y-1">
                            {item.submenu!.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className={`flex items-center px-3 py-2 text-[14px] rounded-lg transition ${
                                    pathname === sub.href
                                      ? "bg-white/10 text-white"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <span className="text-left">
                                    {sub.title}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
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
