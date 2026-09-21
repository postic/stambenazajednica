import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

interface AuthUser {
  uid: string;
  name: string;
  roles?: string[];
  picture?: string | null;
}

function getNextAuthUser(req: NextRequest): AuthUser | null {
  const cookie = req.cookies.get("next_auth")?.value;

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

async function loginToDrupal() {
  const loginResponse = await fetch(
    `${DRUPAL_BASE_URL}/user/login?_format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: process.env.DRUPAL_API_USER,
        pass: process.env.DRUPAL_API_PASSWORD,
      }),
      cache: "no-store",
    }
  );

  if (!loginResponse.ok) {
    const text = await loginResponse.text();

    throw new Error(
      `Drupal login nije uspeo: ${loginResponse.status} ${text}`
    );
  }

  const cookies = loginResponse.headers.get("set-cookie");

  if (!cookies) {
    throw new Error("Drupal session cookie nije pronađen.");
  }

  const cookieHeader = cookies
    .split(",")
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

  const csrfResponse = await fetch(
    `${DRUPAL_BASE_URL}/session/token`,
    {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  if (!csrfResponse.ok) {
    throw new Error("Drupal CSRF token nije pronađen.");
  }

  const csrfToken = await csrfResponse.text();

  return {
    cookieHeader,
    csrfToken,
  };
}

async function parseDrupalResponse(response: Response) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error("Drupal nije vratio JSON:", text);

    throw new Error(
      `Drupal je vratio neispravan odgovor: ${text.substring(0, 300)}`
    );
  }
}

async function findProstor(
  uid: string,
  cookieHeader: string
) {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/prostor` +
    `?filter[field_prostor_user.meta.drupal_internal__target_id]=${encodeURIComponent(
      uid
    )}` +
    `&page[limit]=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const data = await parseDrupalResponse(response);

  if (!response.ok) {
    console.error(
      "Drupal pronalaženje Prostora:",
      data
    );

    throw new Error(
      `Greška pri pronalaženju Prostora: ${response.status}`
    );
  }

  if (!data.data || data.data.length === 0) {
    return null;
  }

  return data.data[0];
}

/**
 * GET /api/forum
 *
 * Vraća listu tema sa:
 * - brojem odgovora
 * - brojem lajkova
 * - autorom
 */
export async function GET() {
  try {
    /*
     * 1. Učitaj teme
     */
    const topicsUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic` +
      `?include=uid` +
      `&sort=-created` +
      `&page[limit]=50`;

    const topicsResponse = await fetch(
      topicsUrl,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    const topicsData =
      await parseDrupalResponse(
        topicsResponse
      );

    if (!topicsResponse.ok) {
      console.error(
        "Drupal forum topics GET:",
        topicsData
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Greška pri učitavanju tema.",
        },
        {
          status: topicsResponse.status,
        }
      );
    }

    /*
     * 2. Učitaj odgovore
     *
     * Iz odgovora ćemo napraviti mapu:
     *
     * replyId -> topicId
     *
     * Tako kasnije možemo da utvrdimo
     * kojoj temi pripada svaki like.
     */
    const repliesUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply` +
      `?page[limit]=1000`;

    const repliesResponse = await fetch(
      repliesUrl,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    const repliesData =
      await parseDrupalResponse(
        repliesResponse
      );

    /*
     * Broj odgovora po temi
     */
    const replyCounts: Record<
      string,
      number
    > = {};

    /*
     * Veza:
     *
     * ID odgovora -> ID teme
     */
    const replyToTopic: Record<
      string,
      string
    > = {};

    if (repliesResponse.ok) {
      const replies =
        repliesData.data || [];

      console.log(
        "=== FORUM REPLIES ==="
      );

      console.log(
        "BROJ ODGOVORA:",
        replies.length
      );

      for (const reply of replies) {
        const topicId =
          reply.relationships
            ?.field_parent_id
            ?.data?.id;

        if (!topicId) {
          console.log(
            "TEMA NIJE PRONAĐENA ZA ODGOVOR:",
            reply.id
          );

          continue;
        }

        /*
         * Zapamti kojoj temi pripada odgovor.
         */
        replyToTopic[reply.id] =
          topicId;

        /*
         * Uvećaj broj odgovora
         * za tu temu.
         */
        replyCounts[topicId] =
          (replyCounts[topicId] || 0) +
          1;
      }

      console.log(
        "BROJ ODGOVORA PO TEMI:",
        JSON.stringify(
          replyCounts,
          null,
          2
        )
      );
    } else {
      console.error(
        "Drupal forum replies GET:",
        repliesData
      );
    }

    /*
     * 3. Učitaj lajkove
     *
     * Ne filtriramo preko:
     *
     * filter[field_reply.id]
     *
     * jer Drupal kod forum_like
     * ne dozvoljava takvo nested filtriranje.
     *
     * Umesto toga učitamo lajkove i
     * filtriramo ih u JavaScript-u.
     */
    const likesUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_like` +
      `?include=field_reply` +
      `&page[limit]=1000`;

    const likesResponse = await fetch(
      likesUrl,
      {
        headers: {
          Accept: "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    const likesData =
      await parseDrupalResponse(
        likesResponse
      );

    /*
     * Broj lajkova po temi
     */
    const likeCounts: Record<
      string,
      number
    > = {};

    if (likesResponse.ok) {
      const likes =
        likesData.data || [];

      console.log(
        "=== FORUM LIKES ==="
      );

      console.log(
        "BROJ LAJKOVA:",
        likes.length
      );

      for (const like of likes) {
        /*
         * ID odgovora na koji se like odnosi.
         */
        const replyId =
          like.relationships
            ?.field_reply
            ?.data?.id;

        if (!replyId) {
          continue;
        }

        /*
         * Preko odgovora pronađi temu.
         */
        const topicId =
          replyToTopic[replyId];

        if (!topicId) {
          continue;
        }

        /*
         * Uvećaj broj lajkova
         * za tu temu.
         */
        likeCounts[topicId] =
          (likeCounts[topicId] || 0) +
          1;
      }

      console.log(
        "BROJ LAJKOVA PO TEMI:",
        JSON.stringify(
          likeCounts,
          null,
          2
        )
      );
    } else {
      console.error(
        "Drupal forum likes GET:",
        likesData
      );
    }

    /*
     * 4. Formiraj listu tema
     */
    const topics = (
      topicsData.data || []
    ).map((item: any) => {
      /*
       * UUID autora teme
       */
      const authorId =
        item.relationships
          ?.uid
          ?.data
          ?.id;

      /*
       * Pronađi autora u included delu
       */
      const author = authorId
        ? (
            topicsData.included || []
          ).find(
            (included: any) =>
              included.type ===
                "user--user" &&
              included.id ===
                authorId
          )
        : null;

      return {
        id: item.id,

        title:
          item.attributes?.title ||
          "",

        body:
          item.attributes?.body
            ?.processed || "",

        created:
          item.attributes?.created ||
          null,

        changed:
          item.attributes?.changed ||
          null,

        prostor:
          item.attributes
            ?.field_prostor ||
          null,

        author:
          author?.attributes?.name ||
          "Nepoznat korisnik",

        /*
         * Broj odgovora za ovu temu.
         */
        replies:
          replyCounts[item.id] ||
          0,

        /*
         * Broj lajkova svih odgovora
         * koji pripadaju ovoj temi.
         */
        likes:
          likeCounts[item.id] ||
          0,
      };
    });

    /*
     * 5. Vrati rezultat
     */
    return NextResponse.json({
      success: true,
      topics,
    });
  } catch (error) {
    console.error(
      "Forum GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška pri učitavanju foruma.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST /api/forum
 *
 * Kreira novu forum temu.
 *
 * Prostor se NE šalje iz frontenda.
 * Uzima se automatski iz trenutno
 * prijavljenog korisnika.
 */
export async function POST(
  req: NextRequest
) {
  try {
    /*
     * 1. Proveri Next autentifikaciju
     */
    const authUser =
      getNextAuthUser(req);

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Korisnik nije prijavljen.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * 2. Pročitaj podatke forme
     */
    const body =
      await req.json();

    const title =
      String(
        body.title ?? ""
      ).trim();

    const text =
      String(
        body.body ?? ""
      ).trim();

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Naslov teme je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Tekst teme je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * 3. Login na Drupal
     */
    const {
      cookieHeader,
      csrfToken,
    } =
      await loginToDrupal();

    /*
     * 4. Pronađi Prostor korisnika
     */
    const prostor =
      await findProstor(
        authUser.uid,
        cookieHeader
      );

    if (!prostor) {
      console.error(
        `Prostor nije pronađen za UID ${authUser.uid}`
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Prostor nije pronađen.",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "Kreiram forum temu za Prostor:",
      prostor.id
    );

    /*
     * 5. Kreiraj temu u Drupalu
     */
    const createResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/vnd.api+json",

            "Content-Type":
              "application/vnd.api+json",

            Cookie:
              cookieHeader,

            "X-CSRF-Token":
              csrfToken,
          },

          body: JSON.stringify({
            data: {
              type:
                "node--forum_topic",

              attributes: {
                title,

                body: {
                  value: text,
                  format:
                    "basic_html",
                },
              },

              relationships: {
                field_prostor: {
                  data: {
                    type:
                      "node--prostor",
                    id: prostor.id,
                  },
                },
              },
            },
          }),

          cache: "no-store",
        }
      );

    const result =
      await parseDrupalResponse(
        createResponse
      );

    if (!createResponse.ok) {
      console.error(
        "Drupal kreiranje forum teme:",
        result
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Drupal nije uspeo da kreira temu.",
          details: result,
        },
        {
          status:
            createResponse.status,
        }
      );
    }

    console.log(
      "Forum tema kreirana:",
      result.data?.id
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Tema je uspešno objavljena.",
        topic: result.data,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Forum POST error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Greška prilikom kreiranja teme.",
      },
      {
        status: 500,
      }
    );
  }
}
