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

interface MenuItem {
  title: string;
  href?: string;
  children?: MenuItem[];
}

interface SidebarItem extends MenuItem {
  icon?: any;
}

const iconMap: Record<string, any> = {
  Transakcije: Wallet,
  Prostori: Building,
  Ankete: Vote,
  Kvarovi: Wrench,
  Obaveštenja: Megaphone,
  Sednice: CalendarCheck,
  Stanari: Users,
  Stanovi: Building,
  Dokumenti: FileText,
  Ostalo: Grid,
  Telefoni: FileText,
};

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [menuSections, setMenuSections] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * Load menu from Drupal
   */
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/api/next-menu`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load Drupal menu");
        }

        const data = await response.json();

        setMenuSections(data);
      } catch (error) {
        console.error("Drupal menu error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  /*
   * Detect mobile
   */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();

    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  /*
   * Automatically open submenu containing current page
   */
  useEffect(() => {
    menuSections.forEach((section) => {
      section.children?.forEach((item) => {
        if (
          item.children?.some((sub) =>
            pathname.startsWith(sub.href || "")
          )
        ) {
          setOpenMenu(item.title);
        }

        if (item.href && pathname.startsWith(item.href)) {
          setOpenMenu(item.title);
        }
      });
    });
  }, [pathname, menuSections]);

  /*
   * Compact menu
   */
  const itemBase =
    "group flex items-center w-full px-3 py-2 text-[14px] font-medium rounded-xl transition-all duration-200";

  const iconClass =
    "w-[18px] h-[18px] shrink-0 text-slate-400 group-hover:text-white transition";

  const isActive = (href?: string) => {
    if (!href) return false;

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /*
   * Render recursive menu
   */
  const renderMenuItem = (
    item: MenuItem,
    level = 0
  ) => {
    const Icon = iconMap[item.title];

    const hasChildren =
      item.children && item.children.length > 0;

    const isOpen = openMenu === item.title;

    const parentActive =
      item.children?.some((child) => {
        if (isActive(child.href)) {
          return true;
        }

        return child.children?.some((sub) =>
          isActive(sub.href)
        );
      }) || false;

    /*
     * Item with submenu
     */
    if (hasChildren) {
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
              {item.children?.map((child) =>
                renderMenuItem(child, level + 1)
              )}
            </ul>
          )}
        </li>
      );
    }

    /*
     * Normal link
     */
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
  };

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

          {loading && (
            <div className="px-3 py-4 text-xs text-slate-500">
              Učitavanje menija...
            </div>
          )}

          {!loading &&
            menuSections.map((section) => (
              <div
                key={section.title}
                className="my-4"
              >

                {!collapsed && (
                  <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {section.title}
                  </div>
                )}

                <ul className="space-y-1.5">
                  {section.children?.map((item) =>
                    renderMenuItem(item)
                  )}
                </ul>

              </div>
            ))}

        </nav>
      </aside>
    </>
  );
}
