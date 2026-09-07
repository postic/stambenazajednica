export interface KategorijaTelefona {
  id: string;
  name: string;
  slug: string;
  brojTelefona: number;
}

export interface Telefon {
  id: string;
  naziv: string;
  broj: string;
  kategorija?: {
    id: string;
    name: string;
  } | null;
}
