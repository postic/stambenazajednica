export interface KategorijaDokumenta {
  id: string;
  name: string;
  slug: string;
  brojDokumenata: number;
}

export interface Dokument {
  id: string;
  title: string;
  tip: string;
  created?: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  date?: string | null; // 👈 DODAJ OVO
  status?: string | null; // 👈 DODAJ OVO
  files: {
    id: string;
    url: string;
    mimeType: string;
  }[];
}

