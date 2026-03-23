export interface Osoba {
  id: string;
  title: string;
  isVlasnik?: boolean; // true ako je vlasnik
}

export interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  sprat?: number | string | null;
  kvadratura?: number | string | null;
  tip?: number | string | null;
  vlasnik?: string | null; // naziv vlasnika
  stanari: Osoba[]; // <-- ovde definišemo array objekata Osoba
}
