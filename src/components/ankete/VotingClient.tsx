"use client";

import { useEffect, useState } from "react";


interface Opcija {
  id: string;
  title: string;
}


interface VotingClientProps {
  anketaId: string;
}



export default function VotingClient({
  anketaId,
}: VotingClientProps) {


  const [opcije, setOpcije] =
    useState<Opcija[]>([]);


  const [selected, setSelected] =
    useState<string | null>(null);


  const [glasao, setGlasao] =
    useState(false);


  const [loading, setLoading] =
    useState(true);


  const [sending, setSending] =
    useState(false);


  const [message, setMessage] =
    useState("");




  useEffect(() => {


    async function load() {


      try {


        const [
          opcijeRes,
          glasaoRes
        ] = await Promise.all([


          fetch(
            `/api/ankete/${anketaId}/opcije`
          ),


          fetch(
            `/api/ankete/${anketaId}/glasao`
          ),


        ]);



        const opcijeData =
          await opcijeRes.json();



        const glasaoData =
          await glasaoRes.json();



        setOpcije(
          opcijeData
        );



        setGlasao(
          glasaoData.glasao
        );



      } catch(error) {


        console.error(
          "Load voting error:",
          error
        );


      } finally {


        setLoading(false);


      }


    }



    load();



  }, [anketaId]);






  async function vote() {


    if (!selected) {

      return;

    }



    setSending(true);

    setMessage("");



    try {


      const res =
        await fetch(

          "/api/glas",

          {

            method:"POST",


            headers:{

              "Content-Type":
                "application/json"

            },


            body:JSON.stringify({

              anketaId,

              opcijaId:selected

            })

          }

        );



      const data =
        await res.json();




      if (!res.ok) {


        setMessage(
          data.error ||
          "Greška prilikom glasanja"
        );


        return;


      }





      setGlasao(true);



      setMessage(
        "Vaš glas je uspešno sačuvan."
      );



    } catch(error) {


      console.error(
        error
      );


      setMessage(
        "Greška servera"
      );


    } finally {


      setSending(false);


    }


  }






  if (loading) {


    return (

      <div className="text-sm text-gray-500">

        Učitavanje...

      </div>

    );


  }







  return (

    <div className="space-y-4">



      {glasao && (

        <div className="
          rounded-lg
          bg-green-50
          p-4
          text-sm
          text-green-700
        ">

          Vaš glas je uspešno sačuvan.

        </div>

      )}






      <div className="space-y-2">


        {opcije.map((opcija) => (


          <label

            key={opcija.id}

            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-lg
              border
              p-3
              hover:bg-slate-50
            "

          >


            <input

              type="radio"

              name="opcija"

              disabled={glasao}

              checked={
                selected === opcija.id
              }


              onChange={() =>
                setSelected(opcija.id)
              }

            />



            <span>

              {opcija.title}

            </span>



          </label>


        ))}


      </div>






      {!glasao && (

        <button

          onClick={vote}

          disabled={
            sending ||
            !selected
          }


          className="
            rounded-lg
            bg-blue-600
            px-5
            py-2
            text-white
            disabled:opacity-50
          "

        >

          {sending
            ? "Slanje..."
            : "Glasaj"
          }


        </button>

      )}







      {message && (

        <div className="
          rounded-lg
          bg-slate-100
          p-3
          text-sm
        ">

          {message}

        </div>

      )}



    </div>

  );

}
