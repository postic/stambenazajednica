export interface Dokument {
  id: string;
  title: string;
  url: string;
  mimeType: string;
}

export interface Sednica {
  id: string;
  title: string;
  body: string;
  created: string;
  status?: string;
  dokumenti?: Dokument[];
}
