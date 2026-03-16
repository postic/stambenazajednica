export function getDrupalFileUrl(file: any) {

  if (!file?.attributes?.uri?.url) return "";

  return process.env.NEXT_PUBLIC_DRUPAL_BASE_URL + file.attributes.uri.url;
}
