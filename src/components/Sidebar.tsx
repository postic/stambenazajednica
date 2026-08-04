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

  const menuSections = [
    {
      title: "ZGRADA",
      items: [
        { title: "Transakcije", icon: Wallet, href: "/transakcije" },
        { title: "Prostori", icon: Building, href: "/stanovi" },
        { title: "Ankete", icon: Vote, href: "/ankete" },
        { title: "Kvarovi", icon: Wrench, href: "/kvarovi" },
        { title: "Obaveštenja", icon: Megaphone, href: "/obavestenja" },
        { title: "Sednice", icon: CalendarCheck, href: "/sednice" },
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
            {
              title: "Finansijski izveštaji",
              href: "/dokumenti/finansijski-izvestaji",
            },
            {
              title: "Odluke",
              href: "/dokumenti/odluke",
            },
            {
              title: "Ponude",
              href: "/dokumenti/ponude",
            },
            {
              title: "Ugovori",
              href: "/dokumenti/ugovori",
            },
            {
              title: "Ostalo",
              href: "/dokumenti/ostalo",
            },
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

  useEffect(() => {
    menuSections.forEach((section) =>
      section.items.forEach((item: SidebarItem) => {
        if (item.submenu?.some((sub) => pathname.startsWith(sub.href))) {
          setOpenMenu(item.title);
        }
      })
    );
  }, [pathname]);

  // KOMPAKTNIJI MENU
  const itemBase =
    "group flex items-center w-full px-3 py-2 text-[14px] font-medium rounded-xl transition-all duration-200";

  const iconClass =
    "w-[18px] h-[18px] shrink-0 text-slate-400 group-hover:text-white transition";

  const isActive = (href?: string) => href && pathname === href;

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
          h-[100dvh] bg-[#0B1120]
          flex flex-col overflow-hidden
          transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/* HEADER */}
        <div className="h-16 md:h-12 flex justify-left border-b border-slate-800 px-4 shrink-0">
          <button
            onClick={() =>
              isMobile
                ? setMobileOpen(!mobileOpen)
                : setCollapsed(!collapsed)
            }
            className="p-1 text-slate-300 hover:text-white transition"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-2 py-1">
          {menuSections.map((section) => (
            <div key={section.title} className="my-4">
              {!collapsed && (
                <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
              )}

              <ul className="space-y-1.5">
                {section.items.map((item: SidebarItem) => {
                  const Icon = item.icon;
                  const isOpen = openMenu === item.title;

                  const parentActive = item.submenu?.some((sub) =>
                    pathname.startsWith(sub.href)
                  );

                  if (item.submenu) {
                    return (
                      <li key={item.title}>
                        <button
                          onClick={() =>
                            setOpenMenu(isOpen ? null : item.title)
                          }
                          className={`${itemBase} ${
                            parentActive
                              ? "bg-white/10 text-white"
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {Icon && (
                            <Icon
                              className={`${iconClass} ${
                                collapsed && !mobileOpen
                                  ? "mx-auto"
                                  : ""
                              }`}
                            />
                          )}

                          {(!collapsed || mobileOpen) && (
                            <>
                              <span className="ml-3 flex-1 text-left">
                                {item.title}
                              </span>

                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </>
                          )}
                        </button>

                        {isOpen && (!collapsed || mobileOpen) && (
                          <ul className="ml-4 mt-1 pl-3 border-l border-slate-800 space-y-0.5">
                            {item.submenu.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`block px-3 py-1 text-[14px] rounded-md transition ${
                                    pathname === sub.href
                                      ? "bg-white/10 text-white"
                                      : "text-slate-400 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  {sub.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href || "#"}
                        onClick={() => setMobileOpen(false)}
                        className={`${itemBase} ${
                          isActive(item.href)
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {Icon && (
                          <Icon
                            className={`${iconClass} ${
                              collapsed && !mobileOpen
                                ? "mx-auto"
                                : ""
                            }`}
                          />
                        )}

                        {(!collapsed || mobileOpen) && (
                          <span className="ml-3 flex-1 text-left">
                            {item.title}
                          </span>
                        )}
                      </Link>
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
