export interface Anketa {
  id: string;
  title: string;
  body?: string;
  created: string;
  status?: string;
  options: Opcija[];
  hasVoted?: boolean;
  userVote?: string;
}

export interface Opcija {
  id: string;
  title: string;
  anketaId: string;
  color?: string;
  order?: number;
  votes?: number; // runtime
}

export interface Glas {
  id: string;
  anketaId: string;
  opcijaId: string;
  userId: string;
  created: string;
}
