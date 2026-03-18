export interface Dokument {
  id: string;
  title: string;
  created?: string | null;
  type?: string;
  files: {
    id: string;
    url: string;
    mimeType: string;
  }[];
}
