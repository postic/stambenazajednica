import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;


    const [
      anketeRes,
      glasoviRes,
    ] = await Promise.all([

      fetch(
        `${baseUrl}/jsonapi/node/anketa?page[limit]=1000`,
        {
          cache: "no-store",
        }
      ),

      fetch(
        `${baseUrl}/jsonapi/node/glas?page[limit]=1000`,
        {
          cache: "no-store",
        }
      ),

    ]);



    const anketeData =
      await anketeRes.json();


    const glasoviData =
      await glasoviRes.json();



    const ankete =
      anketeData.data ?? [];


    const glasovi =
      glasoviData.data ?? [];



    const aktivneAnkete =
      ankete.filter(
        (anketa: any) =>
          anketa.attributes.field_status_ankete === "aktivna"
      ).length;



    return NextResponse.json({

      ukupnoAnketa:
        ankete.length,


      aktivneAnkete,


      ukupnoGlasova:
        glasovi.length,

    });



  } catch (error) {

    console.error(
      "Anketa statistika error:",
      error
    );


    return NextResponse.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );

  }
}
