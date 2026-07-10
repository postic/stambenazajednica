import { NextResponse } from "next/server";
import { cookies } from "next/headers";


export async function POST(
  request: Request
) {

  try {

    const body = await request.json();

    const {
      anketaId,
      opcijaId
    } = body;


    if (!anketaId || !opcijaId) {

      return NextResponse.json(
        {
          error: "Nedostaje anketa ili opcija"
        },
        {
          status: 400
        }
      );

    }


    const cookieStore = await cookies();

console.log(
  "COOKIES:",
  cookieStore.getAll()
);
    /*
      Next auth cookie
    */

    const authCookie = cookieStore.get(
      "next_auth"
    );


    if (!authCookie) {

      return NextResponse.json(
        {
          error:"Niste prijavljeni"
        },
        {
          status:401
        }
      );

    }



    const session = JSON.parse(
      authCookie.value
    );


    const uid = session.uid;



    if (!uid) {

      return NextResponse.json(
        {
          error:"Nema korisničkog ID-a"
        },
        {
          status:401
        }
      );

    }



    /*
      Drupal session cookie
    */

    const drupalCookie = cookieStore
      .getAll()
      .filter(cookie =>
        cookie.name.startsWith("SESS") ||
        cookie.name.startsWith("SSESS")
      )
      .map(cookie =>
        `${cookie.name}=${cookie.value}`
      )
      .join("; ");




    const baseUrl =
      process.env
        .NEXT_PUBLIC_DRUPAL_BASE_URL!;




    /*
      Pronalaženje Drupal UUID korisnika
    */

    const userResponse = await fetch(

      `${baseUrl}/jsonapi/user/user` +
      `?filter[drupal_internal__uid]=${uid}`,

      {
        headers:{

          Cookie:drupalCookie

        },

        cache:"no-store"

      }

    );


    const userData =
      await userResponse.json();



    if (
      !userData.data ||
      userData.data.length === 0
    ) {

      return NextResponse.json(
        {
          error:"Drupal korisnik nije pronađen"
        },
        {
          status:404
        }
      );

    }



    const userUuid =
      userData.data[0].id;




    /*
      Provera postojećeg glasa
    */

    const checkVote =
      await fetch(

        `${baseUrl}/jsonapi/node/glas` +

        `?filter[field_glas_anketa.id]=${anketaId}` +

        `&filter[field_glas_stanar.id]=${userUuid}`,

        {

          headers:{

            Cookie:drupalCookie

          },

          cache:"no-store"

        }

      );



    const existingVote =
      await checkVote.json();




    if (
      existingVote.data &&
      existingVote.data.length > 0
    ) {

      return NextResponse.json(
        {
          error:"Već ste glasali"
        },
        {
          status:400
        }
      );

    }





    /*
      Kreiranje glasa
    */


    const response =
      await fetch(

        `${baseUrl}/jsonapi/node/glas`,

        {

          method:"POST",


          headers:{

            "Content-Type":
              "application/vnd.api+json",

            Accept:
              "application/vnd.api+json",


            Cookie:drupalCookie

          },



          body:JSON.stringify({

            data:{

              type:"node--glas",


              attributes:{

                title:
                  `Glas korisnika ${uid}`

              },



              relationships:{


                field_glas_anketa:{

                  data:{

                    type:"node--anketa",

                    id:anketaId

                  }

                },


                field_glas_opcija:{

                  data:{

                    type:"node--opcija",

                    id:opcijaId

                  }

                },


                field_glas_stanar:{

                  data:{

                    type:"user--user",

                    id:userUuid

                  }

                }


              }

            }

          })

        }

      );




    const result =
      await response.json();




    if (!response.ok) {


      console.error(
        "Drupal error:",
        JSON.stringify(
          result,
          null,
          2
        )
      );


      return NextResponse.json(
        {
          error:"Greška prilikom upisa glasa",
          details:result
        },
        {
          status:response.status
        }
      );

    }




    return NextResponse.json(

      {
        success:true,
        data:result
      },

      {
        status:201
      }

    );



  } catch(error) {


    console.error(
      "POST /api/glas error:",
      error
    );


    return NextResponse.json(
      {
        error:"Server error"
      },
      {
        status:500
      }
    );


  }

}
