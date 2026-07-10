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


    if (!id) {

      return NextResponse.json(
        {
          error: "Nedostaje ID ankete",
        },
        {
          status: 400,
        }
      );

    }



    const response = await fetch(
      `${baseUrl}/jsonapi/node/opcija?filter[field_opcija_anketa.id]=${id}`,
      {
        cache: "no-store",
      }
    );



    if (!response.ok) {

      return NextResponse.json(
        {
          error: "Greška prilikom učitavanja opcija",
        },
        {
          status: response.status,
        }
      );

    }



    const json = await response.json();



    const opcije = json.data.map(
      (item: any) => ({

        id: item.id,

        title:
          item.attributes.title ??
          "",

      })
    );



    return NextResponse.json(opcije);



  } catch (error) {


    console.error(
      "Opcije ankete error:",
      error
    );


    return NextResponse.json(
      {
        error: "Server greška",
      },
      {
        status: 500,
      }
    );


  }

}
