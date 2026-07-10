"use client";

import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle, Vote } from "lucide-react";
import StatCard from "@/components/StatCard";


export default function AnketaStats() {


  const [stats, setStats] = useState({
    ukupnoAnketa: 0,
    aktivneAnkete: 0,
    ukupnoGlasova: 0,
  });



  useEffect(() => {

    async function load() {

      const res = await fetch(
        "/api/ankete/statistika"
      );


      const data =
        await res.json();


      setStats(data);

    }


    load();

  }, []);



  return (

    <div className="
      mb-6
      grid
      grid-cols-1
      gap-4
      md:grid-cols-3
    ">


      <StatCard

        icon={
          <ClipboardList
            className="h-5 w-5 text-blue-600"
          />
        }

        value={
          stats.ukupnoAnketa
        }

        label="Ankete"

      />



      <StatCard

        icon={
          <CheckCircle
            className="h-5 w-5 text-green-600"
          />
        }

        value={
          stats.aktivneAnkete
        }

        label="Aktivne"

      />



      <StatCard

        icon={
          <Vote
            className="h-5 w-5 text-purple-600"
          />
        }

        value={
          stats.ukupnoGlasova
        }

        label="Glasovi"

      />


    </div>

  );

}
