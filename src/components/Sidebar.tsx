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
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(false);

  const [newUsersCount, setNewUsersCount] = useState(3);
  const [newNewsCount, setNewNewsCount] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewUsersCount(Math.floor(Math.random() * 10));
      setNewNewsCount(Math.floor(Math.random() * 5));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const itemBase =
    "w-full flex items-center p-4 rounded-lg transition-all duration-200 hover:bg-slate-700";

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `${itemBase} ${
      collapsed ? "justify-center" : "gap-3"
    } ${isActive(path) ? "bg-slate-700" : ""}`;

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50 h-screen
          bg-slate-800 text-white border-r border-slate-700/50
          flex flex-col
          transition-[width,transform] duration-300 ease-in-out
          ${collapsed ? "md:w-20" : "md:w-64"}
          ${
            mobileOpen
              ? "w-64 translate-x-0"
              : "w-64 -translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div
          className={`flex items-center p-4 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <span className="text-2xl font-bold tracking-wide">
              {user?.name}
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
          >
            <Menu />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-1 px-2">
            {/* DASHBOARD */}
            <li>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/dashboard")}
              >
                <LayoutDashboard className="shrink-0" />
                {!collapsed && <span>Dashboard</span>}
              </Link>
            </li>

            {/* USERS */}
            <li>
              <button
                onClick={() => setOpenSubmenu(!openSubmenu)}
                className={`${itemBase} ${
                  collapsed ? "justify-center" : "justify-between"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="shrink-0" />
                  {!collapsed && <span>Stanari</span>}
                </div>

                {!collapsed && (
                  <span className="text-sm">
                    {openSubmenu ? "−" : "+"}
                  </span>
                )}
              </button>

              {!collapsed && openSubmenu && (
                <ul className="ml-6 mt-1 space-y-1">
                  <li className="flex items-center justify-between">
                    <Link
                      href="/dashboard/users/list"
                      onClick={() => setMobileOpen(false)}
                      className={`block flex-1 p-2 rounded-lg hover:bg-slate-700 ${
                        isActive("/dashboard/users/list")
                          ? "bg-slate-700"
                          : ""
                      }`}
                    >
                      List Users
                    </Link>

                    {newUsersCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">
                        {newUsersCount}
                      </span>
                    )}
                  </li>

                  <li>
                    <Link
                      href="/dashboard/users/add"
                      onClick={() => setMobileOpen(false)}
                      className={`block p-2 rounded-lg hover:bg-slate-700 ${
                        isActive("/dashboard/users/add")
                          ? "bg-slate-700"
                          : ""
                      }`}
                    >
                      Add User
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* KVAROVI */}
            <li>
              <Link
                href="/kvarovi"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/kvarovi")}
              >
                <Wrench className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">Kvarovi</span>
                    {newNewsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {newNewsCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>

            {/* OBAVESTENJA */}
            <li>
              <Link
                href="/obavestenja"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/obavestenja")}
              >
                <Megaphone className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">Obaveštenja</span>
                    {newNewsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {newNewsCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            </li>

            {/* SETTINGS */}
            <li>
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/dashboard/settings")}
              >
                <Settings className="shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
