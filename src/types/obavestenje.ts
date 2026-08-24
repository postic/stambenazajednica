export interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  images?: string[] | null;
  author?: string | null;
  prostor?: string | null;
}
