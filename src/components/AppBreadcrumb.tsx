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
         */
        if (segments.length === 2) {
          const categoryName = slug
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());

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
              },
            ]);
          }

          return;
        }

        /*
         * /obavestenja/[slug]/[id]
         */
        if (segments.length >= 3) {
          const id = segments[2];

          try {
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

            console.log(
              "Breadcrumb API odgovor:",
              json
            );

            /*
             * Podržavamo različite moguće strukture
             * JSON odgovora.
             */
            const node =
              json?.data ??
              json?.node ??
              json;

            const title =
              node?.attributes?.title ??
              node?.title ??
              json?.title ??
              "";

            /*
             * Pronađi kategoriju.
             */
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
             * Ako API vraća included, uzimamo pravi
             * naziv kategorije.
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

            /*
             * Ako imamo naslov, koristimo ga.
             */
            if (title) {
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
                  {
                    label: title,
                  },
                ]);
              }

              return;
            }

            /*
             * Ako iz nekog razloga nema naslova,
             * ne prikazuj UUID kao naziv.
             */
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
             * Ako API ne radi, prikaži samo sigurne
             * delove breadcrumb-a — nikako UUID.
             */
            if (!cancelled) {
              const categoryName = slug
                .replace(/-/g, " ")
                .replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                );

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

      const normalItems =
        rawItems.length > 1
          ? rawItems.slice(0, -1)
          : rawItems;

      if (!cancelled) {
        setItems(normalItems);
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
                {item.href && !isLast ? (
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
