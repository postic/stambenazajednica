"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Bell } from "lucide-react";

interface Notification {
  title: string;
  time: string;
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    { title: "New user registered", time: "2 min ago" },
    { title: "Post approved", time: "10 min ago" },
  ]);

  // Simulate real-time notifications every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification: Notification = {
        title: `Random event #${notifications.length + 1}`,
        time: "Just now",
      };
      setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // keep max 10
    }, 10000);

    return () => clearInterval(interval);
  }, [notifications.length]);

  return (
    <Sheet>
      <SheetTrigger className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 relative">
        <Bell size={24} />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </SheetTrigger>

      {/* Ispravljeno: position → side */}
      <SheetContent side="right" size="sm" className="bg-white dark:bg-gray-800">
        <SheetHeader>
          <SheetTitle className="text-gray-900 dark:text-white">
            Notifications
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {notifications.map((n, i) => (
            <div
              key={i}
              className="p-3 border-b last:border-b-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <div className="font-semibold text-gray-900 dark:text-white">
                {n.title}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-300">
                {n.time}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
