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

export function findBreadcrumb(
  pathname: string,
  resolver?: Resolver
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    { label: "Početna", href: "/" },
  ];

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // statičke rute
    if (routes[currentPath]) {
      items.push({
        label: routes[currentPath],
        href: currentPath,
      });
      return;
    }

    // dinamički (npr UUID)
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

    // fallback
    items.push({
      label: decodeURIComponent(segment),
      href: currentPath,
    });
  });

  return items;
}
