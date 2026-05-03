type Item = {
  title: string;
  href: string;
};

export function buildBreadcrumbs(
  pathname: string,
  items: Item[]
) {
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = [];

  // uvek dodaj početnu
  const home = items.find((i) => i.href === "/");
  if (home) {
    breadcrumbs.push(home);
  }

  let currentPath = "";

  segments.forEach((segment) => {
    currentPath += "/" + segment;

    const match = items.find((i) => i.href === currentPath);

    if (match) {
      breadcrumbs.push(match);
    } else {
      // fallback (npr /stan/12)
      breadcrumbs.push({
        title: decodeURIComponent(segment),
        href: currentPath,
      });
    }
  });

  return breadcrumbs;
}
