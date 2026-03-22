export interface Obavestenje {
  id: string;
  title: string;
  body: string;
  created: string;
  images?: string[] | null;
  type?: string; // naziv statusa iz taxonomy term
}
