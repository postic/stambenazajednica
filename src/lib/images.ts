export function extractImages(
  node: any,
  included: any[] = [],
  fieldName: string
) {
  const imageData = node?.relationships?.[fieldName]?.data;
  if (!imageData) return [];

  const imagesArray = Array.isArray(imageData) ? imageData : [imageData];

  const base = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "";

  return imagesArray
    .map((img: any) => {
      // file
      if (img.type === "file--file") {
        const file = included.find((i) => i.id === img.id);
        return formatUrl(file?.attributes?.uri?.url, base);
      }

      // media
      if (img.type.startsWith("media--")) {
        const media = included.find((i) => i.id === img.id);
        const fileRef = media?.relationships?.field_media_image?.data;
        const file = included.find((i) => i.id === fileRef?.id);
        return formatUrl(file?.attributes?.uri?.url, base);
      }

      return null;
    })
    .filter((url): url is string => Boolean(url));
}

// Popravljena funkcija formatUrl
function formatUrl(url: string | undefined, base: string) {
  if (!url) return null;

  // Ako već počinje sa http, samo vrati
  if (url.startsWith("http")) return url;

  // Ukloni početni / sa Drupal URL-a
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;

  // Ukloni završni / iz base-a
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;

  // Spoji base + url, ovo garantuje da ne nastane web/web
  return `${cleanBase}/${cleanUrl}`;
}
