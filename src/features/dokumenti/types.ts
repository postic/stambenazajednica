export interface Dokument {
  id: string;
  title: string;
  tip: string;
  created?: string | null;
  date?: string | null; // 👈 DODAJ OVO
  status?: string | null; // 👈 DODAJ OVO
  files: {
    id: string;
    url: string;
    mimeType: string;
  }[];
}
