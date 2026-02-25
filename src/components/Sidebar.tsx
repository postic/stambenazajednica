"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, Users, Settings, FileText } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(false);

  // Fake API counters
  const [newUsersCount, setNewUsersCount] = useState(3);
  const [newPostsCount, setNewPostsCount] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewUsersCount(Math.floor(Math.random() * 10));
      setNewPostsCount(Math.floor(Math.random() * 10));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const itemBase =
    "w-full flex items-center p-4 rounded transition-all duration-200 hover:bg-gray-700";

  const isActive = (path: string) => pathname === path;

  const linkClass = (path: string) =>
    `${itemBase} ${
      collapsed ? "justify-center" : "gap-3"
    } ${isActive(path) ? "bg-gray-700" : ""}`;

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
          bg-gray-800 text-white flex flex-col
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
              Admin
            </span>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700 rounded transition"
          >
            <Menu />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 mt-4">
          <ul className="space-y-1">
            {/* Dashboard */}
            <li>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/dashboard")}
              >
                <Menu className="shrink-0" />
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
                  {!collapsed && <span>Users</span>}
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
                      className={`block flex-1 p-2 rounded hover:bg-gray-700 ${
                        isActive("/dashboard/users/list")
                          ? "bg-gray-700"
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
                      className={`block p-2 rounded hover:bg-gray-700 ${
                        isActive("/dashboard/users/add")
                          ? "bg-gray-700"
                          : ""
                      }`}
                    >
                      Add User
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* REPORTS */}
            <li>
              <Link
                href="/dashboard/reports"
                onClick={() => setMobileOpen(false)}
                className={linkClass("/dashboard/reports")}
              >
                <FileText className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">Reports</span>
                    {newPostsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {newPostsCount}
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
