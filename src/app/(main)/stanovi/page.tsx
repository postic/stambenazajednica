"use client";

import { useEffect, useState } from "react";

import { DataTable } from "@/components/table/DataTable";
import { stanoviColumns } from "@/features/stanovi/StanoviColumns";

import type { Stan } from "@/types/stan";

import {
  Home,
  Users,
  Scaling,
} from "lucide-react";

import StatCard from "@/components/StatCard";


type Stats = {
  stanovi: number;
  stanari: number;
  kvadratura: number;
};


export default function StanoviPage() {

  const [loading, setLoading] = useState(true);

  const [stanovi, setStanovi] = useState<Stan[]>([]);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);


  const [stats, setStats] = useState<Stats>({
    stanovi: 0,
    stanari: 0,
    kvadratura: 0,
  });



  useEffect(() => {

    let ignore = false;

    setLoading(true);


    fetch(`/api/stanovi?page=${page}&limit=10`)

      .then((res) => {

        if (!res.ok) {
          throw new Error(
            "Greška pri učitavanju stanova"
          );
        }

        return res.json();

      })

      .then((data) => {

        if (ignore) return;


        setStanovi(
          data.data ?? []
        );


        setTotalPages(
          data.totalPages ?? 1
        );


        setStats(
          data.stats ?? {
            stanovi: 0,
            stanari: 0,
            kvadratura: 0,
          }
        );

      })

      .catch((error) => {

        if (ignore) return;


        console.error(
          "Greška pri učitavanju stanova:",
          error
        );


        setStanovi([]);

      })

      .finally(() => {

        if (!ignore) {
          setLoading(false);
        }

      });


    return () => {
      ignore = true;
    };


  }, [page]);



  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1
  );



  return (

    <div className="max-w-4xl">


      {/* HEADER */}

      <div className="mb-6">


        <div data-field>

          <h1 className="text-xl font-semibold">
            Stanovi
          </h1>


          <p className="mt-1 text-sm text-slate-500">
            Pregled svih stanova u zgradi
          </p>

        </div>



        {/* STATISTIKA */}

        <div className="mt-5 grid grid-cols-3 gap-3">


          <StatCard

            icon={
              <Home className="h-6 w-6 text-green-600" />
            }

            value={stats.stanovi}

            label="Ukupno stanova"

          />



          <StatCard

            icon={
              <Users className="h-6 w-6 text-blue-600" />
            }

            value={stats.stanari}

            label="Prijavljenih stanara"

          />



          <StatCard

            icon={
              <Scaling className="h-6 w-6 text-orange-500" />
            }

            value={`${stats.kvadratura} m²`}

            label="Ukupna površina"

          />


        </div>


      </div>




      {/* TABELA */}


      <DataTable<Stan>

        data={stanovi}

        columns={stanoviColumns}

        loading={loading}

      />





      {/* PAGINACIJA */}


      <div className="flex justify-center mt-8 gap-2 flex-wrap">


        {pages.map((p) => (

          <button

            key={p}

            onClick={() => setPage(p)}

            className={`px-3 py-2 rounded-md border text-sm font-medium transition

              ${
                page === p
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }

            `}

          >

            {p}

          </button>

        ))}


      </div>


    </div>

  );
}
