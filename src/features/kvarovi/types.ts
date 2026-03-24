export interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  status?: string;      // value iz Drupal JSON:API
  prioritet?: string;   // value iz Drupal JSON:API
}
