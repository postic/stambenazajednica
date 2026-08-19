"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { findBreadcrumb } from "@/lib/navigation";

export function AppBreadcrumb() {
  const pathname = usePathname();

  const rawItems = findBreadcrumb(pathname);

  // ❗ izbaci poslednji item (title stranice)
  const items =
    rawItems.length > 1 ? rawItems.slice(0, -1) : rawItems;

  // ako nema šta da se prikaže (npr. /)
  if (!items.length) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={item.href ?? "/"}>
                  {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {index < items.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
