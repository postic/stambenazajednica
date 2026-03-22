export interface Dokument {
  id: string;
  title: string;
  created?: string | null;
  type?: string;
  tip?: string;
  date?: string | null; // 👈 DODAJ OVO
  status?: string | null; // 👈 DODAJ OVO
  files: {
    id: string;
    url: string;
    mimeType: string;
  }[];
}
