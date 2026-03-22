export interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  field_sprat?: number | string | null; // 👈 DODAJ
  field_kvadratura?: number | string | null; // 👈 DODAJ
}
