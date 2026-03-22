export interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  statusName?: string; // naziv statusa iz taxonomy term
}
