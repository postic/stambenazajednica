"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { findBreadcrumb } from "@/lib/navigation";

type Props = {
  title?: string; // Drupal title
};

export function AppBreadcrumb({ title }: Props) {
  const pathname = usePathname();

  const items = findBreadcrumb(pathname, (segment) => {
    // UUID / ID detekcija
    const isDynamic = segment.length > 10 && /\d|[a-f]/i.test(segment);

    if (isDynamic && title) {
      return title;
    }

    return null;
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center space-x-2">
            {!isLast ? (
              <Link href={item.href || "#"} className="hover:text-gray-700">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">
                {item.label}
              </span>
            )}

            {!isLast && <span>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
