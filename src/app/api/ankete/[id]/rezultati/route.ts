import { NextResponse } from "next/server";


interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}


export async function GET(
  request: Request,
  { params }: RouteParams
) {

  try {

    const { id } = await params;


    const baseUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;



    // Svi glasovi za ovu anketu
    const glasoviResponse = await fetch(
      `${baseUrl}/jsonapi/node/glas` +
      `?filter[field_glas_anketa.id]=${id}` +
      `&include=field_glas_opcija`,
      {
        cache: "no-store",
      }
    );



    if (!glasoviResponse.ok) {

      return NextResponse.json(
        {
          error: "Greška kod učitavanja glasova",
        },
        {
          status: 500,
        }
      );

    }



    const glasoviJson =
      await glasoviResponse.json();



    const rezultati: Record<string, number> = {};



    glasoviJson.data.forEach(
      (glas: any) => {


        const opcijaId =
          glas.relationships
            ?.field_glas_opcija
            ?.data
            ?.id;



        if (!opcijaId) {
          return;
        }



        const opcijaNode =
          glasoviJson.included?.find(
            (item: any) =>
              item.id === opcijaId
          );



        const nazivOpcije =
          opcijaNode?.attributes?.title
          ?? "Nepoznata opcija";



        if (!rezultati[nazivOpcije]) {

          rezultati[nazivOpcije] = 0;

        }



        rezultati[nazivOpcije]++;


      }
    );




    const ukupno =
      Object.values(rezultati)
        .reduce(
          (sum, broj) =>
            sum + broj,
          0
        );



    const rezultatArray =
      Object.entries(rezultati)
        .map(
          ([title, broj], index) => ({

            id: String(index),

            title,

            broj,

            procenat:
              ukupno > 0
                ? Math.round(
                    (broj / ukupno) * 100
                  )
                : 0,

          })
        );




    return NextResponse.json({

      rezultati: rezultatArray,

      ukupno,

    });



  } catch(error) {


    console.error(
      "Rezultati ankete error:",
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
