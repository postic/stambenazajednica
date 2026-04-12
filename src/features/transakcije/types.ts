export interface Transakcija {
  id: string;
  title: string;
  amount: number;
  type?: "uplata" | "isplata";
  created: string;
}

export type TransakcijaWithBalance = Transakcija & {
  balance: number;
};
