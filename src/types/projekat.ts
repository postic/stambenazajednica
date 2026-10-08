export type Projekat = {
  id: string;
  title: string;
  body?: string;
  created: string;
  changed: string;
  status: string;
  datumPocetka: string;
  datumZavrsetka: string;
  izvodjac?: string;
};

export type ProjekatDokument = {
  id: string;
  naziv: string;
  url: string;
  description?: string;
};

export type ProjekatDetalj = Projekat & {
  izvestaji: ProjekatDokument[];
};
