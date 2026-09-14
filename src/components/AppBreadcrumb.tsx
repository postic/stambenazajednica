"use client";

import { useEffect, useState } from "react";
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

type BreadcrumbData = {
  label: string;
  href?: string;
};

export function AppBreadcrumb() {
  const pathname = usePathname();

  const [items, setItems] = useState<BreadcrumbData[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadBreadcrumb() {
      const segments = pathname.split("/").filter(Boolean);

      /*
       * --------------------------------------------------
       * OBAVEŠTENJA
       * --------------------------------------------------
       */

      if (
        segments[0] === "obavestenja" &&
        segments.length >= 2
      ) {
        const slug = segments[1];

        /*
         * /obavestenja/[slug]
         *
         * Trenutna kategorija se ne prikazuje.
         * Prikazujemo samo roditelja:
         *
         * Početna / Obaveštenja
         */
        if (segments.length === 2) {
          if (!cancelled) {
            setItems([
              {
                label: "Početna",
                href: "/",
              },
              {
                label: "Obaveštenja",
                href: "/obavestenja",
              },
            ]);
          }

          return;
        }

        /*
         * /obavestenja/[slug]/[id]
         *
         * Prikazujemo:
         *
         * Početna / Obaveštenja / Kategorija
         *
         * Trenutno obaveštenje se ne prikazuje.
         */
        if (segments.length >= 3) {
          try {
            const id = segments[2];

            const response = await fetch(
              `/api/obavestenja/${slug}/${id}`,
              {
                cache: "no-store",
              }
            );

            if (!response.ok) {
              throw new Error(
                `API greška: ${response.status}`
              );
            }

            const json = await response.json();

            const node =
              json?.data ??
              json?.node ??
              json;

            const categoryId =
              node?.relationships
                ?.field_tip_obavestenja?.data?.id ??
              json?.data?.relationships
                ?.field_tip_obavestenja?.data?.id;

            let categoryName = slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              );

            /*
             * Ako API vraća included,
             * uzmi pravi naziv kategorije.
             */
            if (
              categoryId &&
              Array.isArray(json?.included)
            ) {
              const category =
                json.included.find(
                  (item: any) =>
                    item?.type ===
                      "taxonomy_term--tip_obavestenja" &&
                    item?.id === categoryId
                );

              if (category?.attributes?.name) {
                categoryName =
                  category.attributes.name;
              }
            }

            if (!cancelled) {
              setItems([
                {
                  label: "Početna",
                  href: "/",
                },
                {
                  label: "Obaveštenja",
                  href: "/obavestenja",
                },
                {
                  label: categoryName,
                  href: `/obavestenja/${slug}`,
                },
              ]);
            }

            return;
          } catch (error) {
            console.error(
              "Greška pri učitavanju breadcrumb obaveštenja:",
              error
            );

            /*
             * Ako API ne radi, ipak prikaži
             * sigurnu roditeljsku putanju.
             */
            const categoryName = slug
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) =>
                char.toUpperCase()
              );

            if (!cancelled) {
              setItems([
                {
                  label: "Početna",
                  href: "/",
                },
                {
                  label: "Obaveštenja",
                  href: "/obavestenja",
                },
                {
                  label: categoryName,
                  href: `/obavestenja/${slug}`,
                },
              ]);
            }

            return;
          }
        }
      }

      /*
       * --------------------------------------------------
       * SVE OSTALE STRANICE
       * --------------------------------------------------
       */

      const rawItems = findBreadcrumb(pathname);

      /*
       * Uvek uklanjamo trenutnu stranicu.
       *
       * Primer:
       *
       * /prostori/5
       *
       * rawItems:
       * Početna / Prostori / 5
       *
       * rezultat:
       * Početna / Prostori
       */
      const normalItems =
        rawItems.length > 1
          ? rawItems.slice(0, -1)
          : rawItems;

      /*
       * Sve prikazane stavke treba da budu linkovi.
       */
      const linkedItems = normalItems.map((item) => ({
        ...item,
        href: item.href,
      }));

      if (!cancelled) {
        setItems(linkedItems);
      }
    }

    loadBreadcrumb();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!items.length) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast =
            index === items.length - 1;

          return (
            <div
              key={`${item.href ?? item.label}-${index}`}
              className="flex items-center gap-2"
            >
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">
                    {item.label}
                  </span>
                )}
              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
