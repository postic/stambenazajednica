export function stripHtml(html: string): string {
  if (!html) return "";

  if (typeof window === "undefined") {
    return html.replace(/<[^>]*>/g, "");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function truncateByWords(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const trimmed = text.slice(0, maxLength);

  // pronađi poslednji razmak
  const lastSpace = trimmed.lastIndexOf(" ");

  if (lastSpace === -1) {
    // nema razmaka — fallback na hard cut
    return trimmed + "…";
  }

  return trimmed.slice(0, lastSpace) + "…";
}

export function htmlToPreview(html: string, maxLength: number): string {
  const plain = stripHtml(html);
  const clean = normalizeWhitespace(plain);
  return truncateByWords(clean, maxLength);
}
