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

<<<<<<< HEAD
export default function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
=======
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

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
>>>>>>> parent of b5d2742 (Dashboard)
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

<<<<<<< HEAD
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
=======
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
    "group flex items-center w-full px-4 py-3 text-[15px] rounded-xl transition";

  const iconClass =
    "w-5 h-5 shrink-0 text-slate-500 group-hover:text-white transition-colors";
>>>>>>> parent of b5d2742 (Dashboard)

  const Badge = ({ value }: { value?: number }) =>
    value !== undefined ? (
      <span className="ml-auto text-[11px] bg-slate-700 text-white px-2 py-0.5 rounded-full">
        {value}
      </span>
    ) : null;

  const itemClass = (active: boolean) =>
    `${itemBase} ${
      active
        ? "bg-white/10 text-white"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-[100dvh]
          bg-[#0B1120]
          flex flex-col
          overflow-hidden
          transition-all duration-300

          w-72
          md:${collapsed ? "w-20" : "w-72"}

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
<<<<<<< HEAD
        {/* HEADER (malo manji = više prostora za meni) */}
        <div className="h-11 md:h-12 flex items-center border-b border-slate-800 px-3 shrink-0">
=======
        {/* HEADER (FINAL PIXEL PERFECT ALIGN) */}
        <div className="h-16 shrink-0 flex items-center border-b border-slate-800 px-3">
>>>>>>> parent of b5d2742 (Dashboard)
          <button
            onClick={() => {
              if (isMobile) {
                setMobileOpen(!mobileOpen);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="p-2 text-slate-300 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* NAV */}
<<<<<<< HEAD
        <nav className="flex-1 overflow-y-auto px-2 py-1 md:py-2">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-2 md:mb-4">
              {!collapsed && (
                <div className="px-3 mb-1 text-[10px] md:text-[11px] font-semibold uppercase text-slate-500">
=======
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-4 pb-20">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">

              {(!collapsed || mobileOpen) && (
                <div className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
>>>>>>> parent of b5d2742 (Dashboard)
                  {section.title}
                </div>
              )}

              {/* tighter spacing */}
              <ul className="space-y-0.5 md:space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
<<<<<<< HEAD
                  const isActive = pathname === item.href;
                  const isOpen = openMenu === item.title;
                  const hasSub = item.submenu;

                  return (
                    <li key={item.title}>
                      {hasSub ? (
=======
                  const isOpen = openMenu === item.title;

                  const isParentActive =
                    item.submenu &&
                    item.submenu.some((sub) =>
                      pathname.startsWith(sub.href)
                    );

                  if (item.submenu) {
                    return (
                      <li key={item.title}>
>>>>>>> parent of b5d2742 (Dashboard)
                        <button
                          onClick={() =>
                            setOpenMenu(isOpen ? null : item.title)
                          }
                          className={itemClass(!!isParentActive)}
                        >
<<<<<<< HEAD
                          {/* ICON CENTER (kept clean) */}
                          <div className="w-6 h-6 flex items-center justify-center">
                            {Icon && (
                              <Icon className="w-5 h-5 block mx-auto text-slate-500 group-hover:text-white transition-colors" />
                            )}
                          </div>
=======
                          {Icon && (
                            <Icon
                              className={`${iconClass} ${
                                collapsed && !mobileOpen ? "mx-auto" : ""
                              }`}
                            />
                          )}
>>>>>>> parent of b5d2742 (Dashboard)

                          {(!collapsed || mobileOpen) && (
                            <>
                              <span className="ml-3 flex-1">
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
<<<<<<< HEAD
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
=======
>>>>>>> parent of b5d2742 (Dashboard)

                        {(!collapsed || mobileOpen) && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              isOpen ? "max-h-96 mt-2" : "max-h-0"
                            }`}
                          >
                            <ul className="ml-6 pl-3 border-l border-slate-800 space-y-1">
                              {item.submenu.map((sub) => (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-lg text-[14px] transition ${
                                      pathname === sub.href
                                        ? "bg-white/10 text-white"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    <span className="flex-1">
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
                  }

                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href || "#"}
                        onClick={() => setMobileOpen(false)}
                        className={itemClass(pathname === item.href)}
                      >
                        {Icon && (
                          <Icon
                            className={`${iconClass} ${
                              collapsed && !mobileOpen ? "mx-auto" : ""
                            }`}
                          />
                        )}

                        {(!collapsed || mobileOpen) && (
                          <span className="ml-3 flex-1">
                            {item.title}
                          </span>
                        )}

                        {(!collapsed || mobileOpen) &&
                          item.badge !== undefined && (
                            <Badge value={item.badge} />
                          )}
<<<<<<< HEAD
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
=======
                      </Link>
>>>>>>> parent of b5d2742 (Dashboard)
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
