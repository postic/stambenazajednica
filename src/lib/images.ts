export function extractImages(node: any, included: any[] = []) {
  const imageData = node?.relationships?.field_image?.data;
  if (!imageData) return [];

  const imagesArray = Array.isArray(imageData)
    ? imageData
    : [imageData];

  return imagesArray
    .map((img: any) => {
      const file = included.find(
        (inc) => inc.id === img.id
      );

      const url = file?.attributes?.uri?.url;

      return url
        ? `${process.env.DRUPAL_BASE_URL}${url}`
        : null;
    })
    .filter((url): url is string => Boolean(url));
}
