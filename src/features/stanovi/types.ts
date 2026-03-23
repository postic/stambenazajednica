export interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  sprat?: number | string | null; // 👈 DODAJ
  kvadratura?: number | string | null; // 👈 DODAJ
  tip?: number | string | null; // 👈 DODAJ
  vlasnik?: number | string | null; // 👈 DODAJ
}
