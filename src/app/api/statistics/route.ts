
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;


    // =========================
    // STANOVI + STANARI
    // =========================

    const stanoviRes = await fetch(
      `${baseUrl}/jsonapi/node/prostor?page[limit]=1000`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/vnd.api+json",
        },
      }
    );


    if (!stanoviRes.ok) {
      throw new Error("Greška pri učitavanju stanova");
    }


    const stanoviData = await stanoviRes.json();


    const brojStanova =
      stanoviData.data?.length ?? 0;


    let brojStanara = 0;


    stanoviData.data?.forEach((prostor: any) => {

      const broj =
        Number(
          prostor.attributes?.field_prostor_broj_stanara
        ) || 0;


      brojStanara += broj;

    });



    // =========================
    // RAČUN
    // =========================

    const balanceRes = await fetch(
      `${baseUrl}/jsonapi/node/transakcija?page[limit]=1000`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/vnd.api+json",
        },
      }
    );


    if (!balanceRes.ok) {
      throw new Error("Greška pri učitavanju transakcija");
    }


    const balanceData =
      await balanceRes.json();



    let balance = 0;



    balanceData.data?.forEach((item: any) => {

      const iznos =
        Number(
          item.attributes?.field_iznos
        ) || 0;



      const tip =
        item.attributes?.field_tip;



      if (tip === "prihod") {

        balance += iznos;

      }



      if (tip === "rashod") {

        balance -= iznos;

      }

    });



    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        prostori: brojStanova,
        stanari: brojStanara,
        balance,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      }
    );


  } catch (error) {

    console.error(
      "Statistics error:",
      error
    );


    return NextResponse.json(
      {
        error: "Statistics error",
      },
      {
        status: 500,
      }
    );

  }
}
