export interface Dokument {
  id: string;
  title: string;
  created?: string | null;
  type?: string;
  tip?: string;
  files: {
    id: string;
    url: string;
    mimeType: string;
  }[];
}
