export interface Stanar {
  id: string;
  uuid: string;
  created: string;
  image?: string[] | null;
  licna_karta?: string;
  email?: string;
  ime_prezime?: string;
  jmbg?: string;
  telefon?: string;
  vozilo?: string;
  status?: boolean;
  tip?: boolean;
  stan?: number | string | null;
}

