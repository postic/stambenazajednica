export interface Stan {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  sprat?: number | string | null;
  kvadratura?: number | string | null;
  tip?: number | string | null;
  vlasnik?: string | null;
  vlasnikUuid?: string | null;
  broj_stanara?: number | string | null;
  telefon?: string;
  email?: string;
  stanari: Osoba[];
}

export interface Osoba {
  id: string;
  title: string;
  isVlasnik?: boolean; // true ako je vlasnik
}

export interface VlasnikEntity {
  id: string;
  type: string;
  attributes?: {
    title?: string;
    name?: string;
  };
};
