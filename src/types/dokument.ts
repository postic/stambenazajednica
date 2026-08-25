export interface KategorijaDokumenta {
  id: string;
  name: string;
  slug: string;
  brojDokumenata: number;
}

export interface Dokument {
  id: string;
  title: string;
  body: string;
  created: string;
  status: string;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}
