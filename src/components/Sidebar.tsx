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

export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
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

  /* 🔥 COMPACT MENU */
  const itemBase =
<<<<<<< HEAD
    "group relative w-full flex items-center px-3 py-1 text-[15px] transition";
=======
    `
    group flex items-center w-full rounded-lg transition
    px-3 py-1 md:py-1.5
    text-[13px] md:text-[13.5px]
    leading-tight
    `;
>>>>>>> refs/remotes/origin/main

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
          overflow-hidden
          transition-all duration-300

          ${collapsed ? "w-20" : "w-72"}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER (malo manji = više prostora za meni) */}
        <div className="h-11 md:h-12 flex items-center border-b border-slate-800 px-3 shrink-0">
          <button
            onClick={() => {
              if (isMobile) setMobileOpen(!mobileOpen);
              else setCollapsed(!collapsed);
            }}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto px-2 py-1 md:py-2">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-2 md:mb-4">
              {!collapsed && (
                <div className="px-3 mb-1 text-[10px] md:text-[11px] font-semibold uppercase text-slate-500">
                  {section.title}
                </div>
              )}

              {/* tighter spacing */}
              <ul className="space-y-0.5 md:space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  const isOpen = openMenu === item.title;
                  const hasSub = item.submenu;

                  return (
                    <li key={item.title}>
                      {hasSub ? (
                        <button
                          onClick={() =>
                            setOpenMenu(isOpen ? null : item.title)
                          }
                          className={itemClass(false)}
                        >
                          {/* ICON CENTER (kept clean) */}
                          <div className="w-6 h-6 flex items-center justify-center">
                            {Icon && (
                              <Icon className="w-5 h-5 block mx-auto text-slate-500 group-hover:text-white transition-colors" />
                            )}
                          </div>

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
<<<<<<< HEAD
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
=======
                            </>
                          )}
                        </button>
>>>>>>> refs/remotes/origin/main
                      ) : (
                        <Link
                          href={item.href || "#"}
                          className={itemClass(isActive)}
                          onClick={() => setMobileOpen(false)}
                        >
                          <div className="w-6 h-6 flex items-center justify-center">
                            {Icon && (
                              <Icon className="w-5 h-5 block mx-auto text-slate-500 group-hover:text-white transition-colors" />
                            )}
                          </div>

                          {!collapsed && (
                            <span className="ml-3 flex-1 text-left">
                              {item.title}
                            </span>
                          )}
                        </Link>
                      )}

                      {hasSub && !collapsed && (
                        <div
                          className={`overflow-hidden transition-all ${
                            isOpen ? "max-h-96 mt-1" : "max-h-0"
                          }`}
                        >
                          <ul className="ml-5 pl-3 border-l border-slate-800 space-y-0.5">
                            {item.submenu!.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className="
                                    flex items-center px-3 py-1
                                    text-[12.5px] md:text-[13px]
                                    text-slate-400
                                    hover:text-white hover:bg-white/5
                                    rounded-lg
                                    leading-tight
                                  "
                                >
                                  {sub.title}
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
