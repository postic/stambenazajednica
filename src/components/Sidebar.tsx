"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

/*
 * =========================================================
 * IKONE
 * =========================================================
 */

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
};

/*
 * =========================================================
 * SAMO OVI MENIJI IMAJU DROPDOWN
 * =========================================================
 */

const dropdownMenus = [
  "Dokumenti",
  "Ostalo",
];

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] =
    useState<string | null>(null);

  const [collapsed, setCollapsed] =
    useState(false);

  const [isMobile, setIsMobile] =
    useState(false);

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  /*
   * =========================================================
   * UČITAVANJE MENIJA IZ DRUPAL-A
   * =========================================================
   */

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await fetch("/api/next-menu", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Failed to load Drupal menu"
          );
        }

        const data = await response.json();

        console.log(
          "NEXT MENU:",
          data
        );

        setMenuItems(data);
      } catch (error) {
        console.error(
          "Drupal menu error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  /*
   * =========================================================
   * MOBILE DETECTION
   * =========================================================
   */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener(
      "resize",
      checkMobile
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  /*
   * =========================================================
   * ACTIVE LINK
   * =========================================================
   */

  const isActive = (href?: string) => {
    if (!href || href === "#") {
      return false;
    }

    const normalizedHref =
      href.replace(/\/$/, "") || "/";

    const normalizedPath =
      pathname.replace(/\/$/, "") || "/";

    return (
      normalizedPath === normalizedHref ||
      normalizedPath.startsWith(
        `${normalizedHref}/`
      )
    );
  };

  /*
   * =========================================================
   * ACTIVE CHILD
   * =========================================================
   */

  const hasActiveChild = (
    item: MenuItem
  ): boolean => {
    if (
      !item.children ||
      item.children.length === 0
    ) {
      return false;
    }

    return item.children.some(
      (child) => {
        if (isActive(child.href)) {
          return true;
        }

        if (
          child.children &&
          child.children.length > 0
        ) {
          return child.children.some(
            (sub) =>
              isActive(sub.href)
          );
        }

        return false;
      }
    );
  };

  /*
   * =========================================================
   * AUTOMATSKI OTVORI / ZATVORI DROPDOWN
   * =========================================================
   *
   * Ako je trenutni URL unutar dropdown-a:
   *     → otvori taj dropdown
   *
   * Ako nije:
   *     → zatvori dropdown
   *
   * Ovo znači da npr. klik na:
   *
   * Dokumenti
   *    └── Dokument 1
   *
   * ostavlja Dokumente otvorene.
   *
   * Ali odlazak na:
   *
   * /transakcije
   * /ankete
   * /stanari
   *
   * zatvara dropdown.
   */

  useEffect(() => {
    let activeDropdown: string | null = null;

    for (const item of menuItems) {
      if (
        dropdownMenus.includes(item.title) &&
        hasActiveChild(item)
      ) {
        activeDropdown = item.title;
        break;
      }
    }

    setOpenMenu(activeDropdown);
  }, [
    pathname,
    menuItems,
  ]);

  /*
   * =========================================================
   * STILOVI
   * =========================================================
   */

  const itemBase =
    "group flex items-center w-full px-3 py-2 text-[14px] font-medium rounded-xl transition-all duration-200";

  const iconClass =
    "w-[18px] h-[18px] shrink-0 text-slate-400 group-hover:text-white transition";

  /*
   * =========================================================
   * NORMALAN LINK
   * =========================================================
   */

  const renderNormalLink = (
    item: MenuItem
  ) => {
    const Icon =
      iconMap[item.title];

    return (
      <li key={item.title}>
        <Link
          href={item.href || "#"}
          onClick={() => {
            setMobileOpen(false);

            // Ako kliknemo na običan link,
            // zatvori svaki otvoreni dropdown.
            setOpenMenu(null);
          }}
          className={`${itemBase} ${
            isActive(item.href)
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >
          {Icon && (
            <Icon
              className={`${iconClass} ${
                collapsed &&
                !mobileOpen
                  ? "mx-auto"
                  : ""
              }`}
            />
          )}

          {(!collapsed ||
            mobileOpen) && (
            <span className="ml-3 flex-1 text-left">
              {item.title}
            </span>
          )}
        </Link>
      </li>
    );
  };

  /*
   * =========================================================
   * DROPDOWN
   * =========================================================
   */

  const renderDropdown = (
    item: MenuItem
  ) => {
    const Icon =
      iconMap[item.title];

    const isOpen =
      openMenu === item.title;

    const parentActive =
      isActive(item.href) ||
      hasActiveChild(item);

    return (
      <li key={item.title}>

        {/*
         * =====================================================
         * ROOT ROW
         * =====================================================
         */}

        <div
          className={`${itemBase} ${
            parentActive
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          }`}
        >

          {/*
           * ===================================================
           * LINK
           * ===================================================
           */}

          <Link
            href={item.href || "#"}
            onClick={() => {
              setMobileOpen(false);

              /*
               * Ne zatvaramo dropdown ovde.
               *
               * pathname će se promeniti i
               * useEffect iznad će odlučiti
               * da li dropdown treba da ostane
               * otvoren ili da se zatvori.
               */
            }}
            className="flex items-center flex-1 min-w-0"
          >
            {Icon && (
              <Icon
                className={`${iconClass} ${
                  collapsed &&
                  !mobileOpen
                    ? "mx-auto"
                    : ""
                }`}
              />
            )}

            {(!collapsed ||
              mobileOpen) && (
              <span className="ml-3 flex-1 text-left">
                {item.title}
              </span>
            )}
          </Link>

          {/*
           * ===================================================
           * ARROW
           * ===================================================
           */}

          {(!collapsed ||
            mobileOpen) && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setOpenMenu(
                  isOpen
                    ? null
                    : item.title
                );
              }}
              className="ml-2 p-1 rounded-md hover:bg-white/10"
              aria-label={
                isOpen
                  ? `Zatvori ${item.title}`
                  : `Otvori ${item.title}`
              }
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          )}
        </div>

        {/*
         * =====================================================
         * CHILDREN
         * =====================================================
         */}

        {isOpen &&
          (!collapsed ||
            mobileOpen) &&
          item.children &&
          item.children.length > 0 && (
            <ul className="ml-4 mt-1 pl-3 border-l border-slate-800 space-y-0.5">
              {item.children.map(
                (child) => {
                  const ChildIcon =
                    iconMap[
                      child.title
                    ];

                  return (
                    <li
                      key={
                        child.title
                      }
                    >
                      <Link
                        href={
                          child.href ||
                          "#"
                        }
                        onClick={() =>
                          setMobileOpen(
                            false
                          )
                        }
                        className={`${itemBase} ${
                          isActive(
                            child.href
                          )
                            ? "bg-white/10 text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {ChildIcon && (
                          <ChildIcon
                            className={
                              iconClass
                            }
                          />
                        )}

                        <span className="ml-3 flex-1 text-left">
                          {
                            child.title
                          }
                        </span>
                      </Link>
                    </li>
                  );
                }
              )}
            </ul>
          )}
      </li>
    );
  };

  /*
   * =========================================================
   * SIDEBAR
   * =========================================================
   */

  return (
    <>
      {/*
       * =====================================================
       * MOBILE OVERLAY
       * =====================================================
       */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`
          fixed md:static
          top-0 left-0
          z-50
          h-[100dvh]
          bg-[#0B1120]
          flex flex-col
          overflow-hidden
          transition-all duration-300

          ${
            collapsed
              ? "w-16"
              : "w-64"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/*
         * =====================================================
         * HEADER
         * =====================================================
         */}

        <div className="h-16 md:h-12 flex items-center border-b border-slate-800 px-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isMobile) {
                setMobileOpen(
                  !mobileOpen
                );
              } else {
                setCollapsed(
                  !collapsed
                );
              }
            }}
            className="p-1 text-slate-300 hover:text-white transition"
            aria-label="Otvori/zatvori meni"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/*
         * =====================================================
         * NAV
         * =====================================================
         */}

        <nav className="flex-1 overflow-y-auto px-2 py-4">

          {/*
           * LOADING
           */}

          {loading && (
            <div className="px-3 py-4 text-xs text-slate-500">
              Učitavanje menija...
            </div>
          )}

          {/*
           * MENU
           */}

          {!loading &&
            menuItems.length > 0 && (
              <ul className="space-y-1.5">
                {menuItems.map(
                  (item) => {

                    /*
                     * SAMO Dokumenti
                     * i Ostalo imaju
                     * dropdown.
                     */

                    if (
                      dropdownMenus.includes(
                        item.title
                      ) &&
                      item.children &&
                      item.children.length >
                        0
                    ) {
                      return renderDropdown(
                        item
                      );
                    }

                    /*
                     * SVE OSTALO JE
                     * NORMALAN LINK.
                     */

                    return renderNormalLink(
                      item
                    );
                  }
                )}
              </ul>
            )}

          {/*
           * EMPTY STATE
           */}

          {!loading &&
            menuItems.length ===
              0 && (
              <div className="px-3 py-4 text-xs text-slate-500">
                Meni je prazan.
              </div>
            )}
        </nav>
      </aside>
    </>
  );
}
