"use client";

import { useEffect, useState } from "react";

interface Rezultat {
  id: string;
  title: string;
  broj: number;
  procenat: number;
}

interface ResultsProps {
  anketaId: string;
}

export default function Results({
  anketaId,
}: ResultsProps) {

  const [rezultati, setRezultati] = useState<Rezultat[]>([]);
  const [ukupno, setUkupno] = useState(0);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function loadResults() {

      try {

        const res = await fetch(
          `/api/ankete/${anketaId}/rezultati`
        );

        const data = await res.json();


        setRezultati(
          data.rezultati ?? []
        );

        setUkupno(
          data.ukupno ?? 0
        );


      } catch (error) {

        console.error(
          "Results error:",
          error
        );

      } finally {

        setLoading(false);

      }

    }


    loadResults();


  }, [anketaId]);



  if (loading) {

    return (
      <div className="text-sm text-gray-500">
        Učitavanje rezultata...
      </div>
    );

  }



  return (

    <div className="mt-6 space-y-4">


      <h2 className="
        text-lg
        font-semibold
        text-slate-900
      ">
        Rezultati
      </h2>



      {rezultati.map((item) => (

        <div
          key={item.id}
          className="space-y-2"
        >

          <div className="
            flex
            justify-between
            text-sm
          ">

            <span className="font-medium">
              {item.title}
            </span>

            <span className="text-gray-500">
              {item.broj} ({item.procenat}%)
            </span>

          </div>



          <div className="
            h-3
            overflow-hidden
            rounded-full
            bg-slate-200
          ">

            <div
              className="
                h-full
                rounded-full
                bg-blue-600
              "
              style={{
                width: `${item.procenat}%`,
              }}
            />

          </div>


        </div>

      ))}



      <div className="
        pt-3
        text-sm
        text-gray-500
      ">
        Ukupno glasova: {ukupno}
      </div>


    </div>

  );

}
