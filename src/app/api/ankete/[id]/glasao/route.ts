import { NextResponse } from "next/server";
import { cookies } from "next/headers";


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


    const cookieStore = await cookies();

    const authCookie = cookieStore.get("next_auth");


    if (!authCookie) {
      return NextResponse.json({
        voted: false,
        authenticated: false,
      });
    }


    const session = JSON.parse(authCookie.value);

    const uid = session.uid;


    if (!uid) {
      return NextResponse.json({
        voted:false,
        authenticated:false,
      });
    }



    const baseUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;

    const response = await fetch(
      `${baseUrl}/jsonapi/node/glas` +
      `?filter[field_glas_anketa.id]=${id}` +
      `&filter[field_glas_stanar.id]=${uid}`,
      {
        headers:{
          Cookie: `${authCookie.name}=${encodeURIComponent(authCookie.value)}`,
        },
        cache:"no-store",
      }
    );



    if(!response.ok){

      return NextResponse.json(
        {
          error:"Greška pri proveri glasa"
        },
        {
          status:500
        }
      );

    }



    const data = await response.json();



    return NextResponse.json({

      voted: data.data?.length > 0,

      glasId:
        data.data?.[0]?.id ?? null,

    });



  } catch(error){

    console.error(
      "Provera glasa:",
      error
    );


    return NextResponse.json(
      {
        error:"Server greška"
      },
      {
        status:500
      }
    );

  }

}
