// /config/navigation.ts

import { Home, Wrench, Vote, Megaphone } from "lucide-react";

export const navigation = [
  { title: "Početna", href: "/", icon: Home },
  { title: "Kvarovi", href: "/kvarovi", icon: Wrench },
  { title: "Ankete", href: "/ankete", icon: Vote },
  { title: "Obaveštenja", href: "/obavestenja", icon: Megaphone },
];
