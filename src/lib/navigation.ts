type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Resolver = (segment: string) => string | null;

const routes: Record<string, string> = {
  "/": "Početna",
  "/ankete": "Ankete",
  "/transakcije": "Transakcije",
  "/kvarovi": "Kvarovi",
  "/obavestenja": "Obaveštenja",
  "/sednice": "Sednice",
  "/stanovi": "Stanovi",
  "/stanari": "Stanari",
  "/dokumenti": "Dokumenti",
};

function formatSegment(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function findBreadcrumb(
  pathname: string,
  resolver?: Resolver
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    {
      label: "Početna",
      href: "/",
    },
  ];

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Statičke rute
    if (routes[currentPath]) {
      items.push({
        label: routes[currentPath],
        href: currentPath,
      });

      return;
    }

    // Dinamički segmenti
    if (resolver) {
      const resolved = resolver(segment);

      if (resolved) {
        items.push({
          label: resolved,
          href: currentPath,
        });

        return;
      }
    }

    // Fallback
    items.push({
      label: formatSegment(segment),
      href: currentPath,
    });
  });

  return items;
}
