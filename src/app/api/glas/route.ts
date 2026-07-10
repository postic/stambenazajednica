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
          error:"Nedostaje anketa ili opcija"
        },
        {
          status:400
        }
      );

    }



    const cookieStore =
      await cookies();



    /*
      Next auth korisnik
    */


    const authCookie =
      cookieStore.get(
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



    const session =
      JSON.parse(
        authCookie.value
      );



    const uid =
      session.uid;



    if (!uid) {

      return NextResponse.json(
        {
          error:"Nema UID"
        },
        {
          status:401
        }
      );

    }



    const baseUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL!;



    /*
      Drupal login
    */


    const loginResponse =
      await fetch(

        `${baseUrl}/user/login?_format=json`,

        {

          method:"POST",

          headers:{

            "Content-Type":
              "application/json",

            Accept:
              "application/json"

          },


          body:JSON.stringify({

            name:
              process.env.DRUPAL_API_USER,

            pass:
              process.env.DRUPAL_API_PASSWORD

          })

        }

      );



    const loginData =
      await loginResponse.json();



    if (!loginResponse.ok) {


      console.error(
        "Drupal login error",
        loginData
      );


      return NextResponse.json(
        {
          error:"Drupal login neuspešan",
          details:loginData
        },
        {
          status:401
        }
      );

    }



    /*
      Drupal session cookie
    */


    const setCookie =
      loginResponse.headers.get(
        "set-cookie"
      );



    if (!setCookie) {

      return NextResponse.json(
        {
          error:"Drupal nije vratio session cookie"
        },
        {
          status:401
        }
      );

    }



    const drupalCookie =
      setCookie.split(";")[0];




    /*
      Drupal CSRF token
    */


    const csrfResponse =
      await fetch(

        `${baseUrl}/session/token`,

        {

          headers:{

            Cookie:
              drupalCookie

          },

          cache:"no-store"

        }

      );



    const csrfToken =
      await csrfResponse.text();



    console.log(
      "CSRF TOKEN:",
      csrfToken
    );





    /*
      Pronađi Drupal UUID korisnika
      preko next_auth uid
    */


    const userResponse =
      await fetch(

        `${baseUrl}/jsonapi/user/user` +
        `?filter[drupal_internal__uid]=${uid}`,

        {

          headers:{

            Cookie:
              drupalCookie

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
          error:"Korisnik nije pronađen"
        },
        {
          status:404
        }
      );

    }



    const userUuid =
      userData.data[0].id;




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

            Cookie:
              drupalCookie,


            "X-CSRF-Token":
              csrfToken

          },


          body:JSON.stringify({

            data:{

              type:"node--glas",


              attributes:{

                title:
                  `Glas korisnika ${uid}`

              },


              relationships:{


                uid:{

                  data:{

                    type:"user--user",

                    id:userUuid

                  }

                },



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
        "Drupal create glas error",
        JSON.stringify(
          result,
          null,
          2
        )
      );


      return NextResponse.json(
        {
          error:"Greška pri kreiranju glasa",
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
      "POST /api/glas error",
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
