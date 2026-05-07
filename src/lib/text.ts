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

export function isEmptyHtml(html?: string): boolean {
  if (!html) return true;

  const clean = html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean.length === 0;
}

export function formatRSD(amount: number) {
  return new Intl.NumberFormat("sr-Latn-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toRoman(num: number): string {
  const map = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";

  for (const item of map) {
    while (num >= item.value) {
      result += item.numeral;
      num -= item.value;
    }
  }

  return result;
}
