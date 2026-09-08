export interface KategorijaObavestenja {
  id: string;
  name: string;
  slug: string;
  brojObavestenja: number;
}

export interface Obavestenje {
  id: string;
  title: string;
  created?: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
}

export interface ObavestenjeDetalj {
  id: string;
  title: string;
  body: string;
  created: string;
  author: string | null;
  images: string[];
}
