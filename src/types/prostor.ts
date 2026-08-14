export interface Prostor {
  id: string;
  title: string;
  body: string;
  created: string;
  sprat?: number | string | null;
  kvadratura?: number | string | null;
  tip?: string | null;
  vlasnik?: string | null;
  broj_stanara?: number | string | null;
  telefon?: string;
  email?: string;
  stanari?: string;
  broj_prostora?: number | string | null;
}
