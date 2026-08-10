export interface Prostor {
  id: string;
  title: string;
  body: string;
  created: string;
  image?: string[] | null;
  sprat?: number | string | null;
  kvadratura?: number | string | null;
  tip_prostora?: number | string | null;
  vlasnik?: string | null;
  broj_stanara?: number | string | null;
  telefon?: string;
  email?: string;
  stanari?: string;
}
