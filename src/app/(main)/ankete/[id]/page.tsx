"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, BarChart3, Vote } from "lucide-react";

import VotingForm from "@/components/ankete/VotingClient";
import Rezultati from "@/components/ankete/Results";
import StatusBadge from "@/components/StatusBadge";


interface Anketa {

  id: string;
  title: string;
  pitanje: string;
  body: string;
  status: string;
  created: string;

}


interface Opcija {

  id: string;
  title: string;

}


export default function AnketaDetaljPage() {


  const params = useParams();

  const id = params.id as string;


  const [anketa, setAnketa] =
    useState<Anketa | null>(null);


  const [opcije, setOpcije] =
    useState<Opcija[]>([]);


  const [glasao, setGlasao] =
    useState<boolean | null>(null);



  useEffect(() => {


    async function load() {


      try {


        // anketa

        const anketaResponse =
          await fetch(
            `/api/ankete/${id}`,
            {
              cache: "no-store"
            }
          );


        const anketaData =
          await anketaResponse.json();


        setAnketa(anketaData);



        // opcije ankete

        const opcijeResponse =
          await fetch(
            `/api/ankete/${id}/opcije`,
            {
              cache: "no-store"
            }
          );


        const opcijeData =
          await opcijeResponse.json();


        setOpcije(opcijeData);



        // provera glasa

        const glasResponse =
          await fetch(
            `/api/ankete/${id}/glasao`,
            {
              cache: "no-store"
            }
          );


        const glasData =
          await glasResponse.json();


        setGlasao(
          glasData.voted
        );



      } catch(error) {

        console.error(error);

      }


    }


    if(id) {

      load();

    }


  }, [id]);





  if(!anketa || glasao === null) {


    return (

      <div className="w-full py-6 text-sm text-center">

        <div className="flex flex-col items-center gap-2">

          <Loader2
            className="w-5 h-5 text-gray-400 animate-spin"
          />

          <div className="text-gray-400 text-sm">
            Podaci se učitavaju...
          </div>

        </div>

      </div>

    );


  }




  return (

    <div className="max-w-4xl">


      {/* HEADER */}

      <div className="mb-6">

        <div className="flex items-start justify-between gap-4">


          <div>

            <h1 className="text-xl font-semibold text-slate-800">

              {anketa.title}

            </h1>


            <p className="text-sm text-slate-400 mt-1">

              {new Date(anketa.created).toLocaleDateString(
                "sr-Latn-RS",
                {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }
              )}

            </p>


          </div>



          <div className="flex items-center gap-2 flex-wrap justify-end">

            {
              anketa.status &&
              <StatusBadge status={anketa.status} />
            }

          </div>


        </div>


      </div>





      {/* OPIS ANKETE */}

      <div className="border border-slate-200 bg-slate-50 rounded-xl p-6 mb-6">


        <div
          className="text-sm text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: anketa.body
          }}
        />


      </div>





      {/* GLASANJE / REZULTATI */}


      {
        glasao ? (

          <div className="bg-slate-50 border border-slate-200 p-6 mb-6">


            <div className="flex items-center gap-2 mb-4">

  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
    <BarChart3 className="w-5 h-5 text-slate-600" />
  </div>

  <h3 className="text-lg font-semibold text-slate-800">
    Rezultati glasanja
  </h3>

</div>



            <Rezultati

              anketaId={id}

            />


          </div>


        ) : (


          <div className="bg-slate-50 border border-slate-200 p-6 mb-6">


            <div className="flex items-center gap-2 mb-4">

  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
    <Vote className="w-5 h-5 text-slate-600" />
  </div>

  <h3 className="text-lg font-semibold text-slate-800">
    Vaš odgovor
  </h3>

</div>



            <VotingForm

              anketaId={id}

            />


          </div>


        )

      }


    </div>

  );


}
