export interface Dokument {
  id: string;
  title: string;
  created?: string;
  status?: string;
  files?: {
    id: string;
    url: string;
    filemime?: string;
  }[];
}
