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
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;

    const { id } = await params;


    const response = await fetch(
      `${baseUrl}/jsonapi/node/anketa/${id}`,
      {
        cache: "no-store",
      }
    );


    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Anketa nije pronađena",
        },
        {
          status: response.status,
        }
      );
    }


    const json = await response.json();

    const item = json.data;


    const anketa = {
      id: item.id,

      title:
        item.attributes.title ?? "",

      pitanje:
        item.attributes.field_anketa_pitanje ?? "",

      body:
        item.attributes.body?.processed ?? "",

      status:
        item.attributes.field_status_ankete ?? "",

      created:
        item.attributes.created ?? "",
    };


    return NextResponse.json(anketa);


  } catch (error) {
    console.error(
      "Anketa detail error:",
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
