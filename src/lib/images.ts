export function extractImages(
  node: any,
  included: any[] = [],
  fieldName: string
) {
  const imageData = node?.relationships?.[fieldName]?.data;
  if (!imageData) return [];

  const imagesArray = Array.isArray(imageData)
    ? imageData
    : [imageData];

  const base = process.env.DRUPAL_BASE_URL || "";

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
        const fileRef =
          media?.relationships?.field_media_image?.data;

        const file = included.find((i) => i.id === fileRef?.id);
        return formatUrl(file?.attributes?.uri?.url, base);
      }

      return null;
    })
    .filter((url): url is string => Boolean(url));
}

function formatUrl(url: string | undefined, base: string) {
  if (!url) return null;

  if (url.startsWith("http")) return url;

  let full = `${base}${url}`;
  full = full.replace(/([^:]\/)\/+/g, "$1");

  return full;
}
