export interface Anketa {
  id: string;
  title: string;
  pitanje: string;
  body: string;
  status: string;
  created: string;
  opcije: Opcija[];
}

export interface Opcija {
  id: string;
  title: string;
}

interface Glas {
  id: string;
  anketaId: string;
  opcijaId: string;
  stanarId: string;
}
