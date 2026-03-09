export function extractImages(node: any, included: any[] = []) {
  const imageData = node?.relationships?.field_image?.data;
  if (!imageData) return [];

  const imagesArray = Array.isArray(imageData)
    ? imageData
    : [imageData];

  const base = process.env.DRUPAL_BASE_URL || "";

  return imagesArray
    .map((img: any) => {
      const file = included.find((inc) => inc.id === img.id);
      const url = file?.attributes?.uri?.url;

      if (!url) return null;

      // ako je već apsolutni URL
      if (url.startsWith("http")) return url;

      let full = `${base}${url}`;

      // ukloni duple slashes
      full = full.replace(/([^:]\/)\/+/g, "$1");

      // ukloni dupli /web
      full = full.replace(/\/web\/web\//, "/web/");

      return full;
    })
    .filter((url): url is string => Boolean(url));
}
