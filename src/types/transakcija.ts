export type FileItem = {
  url: string;
  filename?: string;
  mime?: string;
  description?: string;
  size?: number;
};

// 🔹 BASE (Drupal raw)
export interface Transakcija {
  id: string;
  title: string;
  body: string;
  amount: number;
  type?: "uplata" | "isplata";
  created: string;
}

// 🔹 LIST VIEW (bez files)
export type TransakcijaWithBalance = Transakcija & {
  balance: number;
};

// 🔹 DETAIL VIEW (sa files)
export type TransakcijaDetail = TransakcijaWithBalance & {
  files: FileItem[];
};
