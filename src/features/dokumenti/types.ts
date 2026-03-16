export interface DokumentFile {
  id: string;
  url: string;
  mimeType: string;
}

export interface Dokument {
  id: string;
  title: string;
  status?: string;
  date?: string;
  files: DokumentFile[];
}
