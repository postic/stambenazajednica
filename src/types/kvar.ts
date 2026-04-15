export interface Kvar {
  id: string;
  title: string;
  body: string;
  created: string | null;
  image: string[] | null;
  status: "prijavljen" | "u_obradi" | "na_cekanju" | "resen" | null;
  priority: "nizak" | "srednji" | "visok" | "hitno" | null;
}
