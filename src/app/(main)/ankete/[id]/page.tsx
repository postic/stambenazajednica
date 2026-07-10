"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import VotingForm from "@/components/ankete/VotingClient";
import Rezultati from "@/components/ankete/Results";
import StatusBadge from "@/components/StatusBadge";


interface Anketa {

  id:string;
  title:string;
  pitanje:string;
  body:string;
  status:string;
  created:string;

}



interface Opcija {

  id:string;
  title:string;

}



export default function AnketaDetaljPage(){


const params = useParams();

const id = params.id as string;



const [anketa,setAnketa] =
useState<Anketa | null>(null);


const [opcije,setOpcije] =
useState<Opcija[]>([]);


const [glasao,setGlasao] =
useState<boolean | null>(null);



useEffect(()=>{


async function load(){


try{


// anketa

const anketaResponse =
await fetch(
 `/api/ankete/${id}`,
 {
  cache:"no-store"
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
  cache:"no-store"
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
  cache:"no-store"
 }
);


const glasData =
await glasResponse.json();


setGlasao(
 glasData.voted
);



}catch(error){

console.error(error);

}


}


if(id){

load();

}


},[id]);





if(!anketa || glasao === null){

return (

<div className="p-6 text-center">

Učitavanje ankete...

</div>

);

}

return (

  <div className="max-w-4xl">

    {/* HEADER */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div data-field>
            <h1 className="text-xl font-semibold">
              {anketa.title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {new Date(anketa.created).toLocaleDateString("sr-Latn-RS", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {anketa.status && <StatusBadge status={anketa.status} />}
          </div>
        </div>
      </div>

    <div className="border border-slate-200 bg-slate-50 p-4 mb-6">

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {anketa.pitanje}
        </h2>

        <p className="text-slate-600">
          {anketa.body}
        </p>
      </div>
{
glasao ?


(

<div>

<h3 className="font-semibold mb-4">

Rezultati glasanja

</h3>


<Rezultati
 anketaId={id}
/>


</div>


)


:


(

<div>


<h3 className="font-semibold mb-4">

Vaš odgovor

</h3>


<VotingForm

anketaId={id}

opcije={opcije}

      />
      </div>
      )
    }
    </div>
  </div>
  );
}
