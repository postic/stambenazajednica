import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

interface AuthUser {
  uid: number;
  name?: string;
  roles?: string[];
  picture?: string | null;
  broj?: string | null;
}

interface DrupalResponse {
  jsonapi?: any;
  data?: any;
  included?: any[];
  links?: any;
  meta?: any;
  errors?: any[];
}

/**
 * Čita trenutno prijavljenog korisnika iz next_auth cookie-ja.
 */
async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("next_auth");

  if (!authCookie?.value) {
    return null;
  }

  try {
    return JSON.parse(authCookie.value) as AuthUser;
  } catch (error) {
    console.error(
      "Greška pri čitanju next_auth cookie-ja:",
      error
    );

    return null;
  }
}

/**
 * Prijava u Drupal preko API korisnika.
 */
async function loginToDrupal() {
  if (!DRUPAL_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_DRUPAL_BASE_URL nije podešen."
    );
  }

  const username = process.env.DRUPAL_API_USER;
  const password = process.env.DRUPAL_API_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "DRUPAL_API_USER ili DRUPAL_API_PASSWORD nisu podešeni."
    );
  }

  const loginRes = await fetch(
    `${DRUPAL_BASE_URL}/user/login?_format=json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: username,
        pass: password,
      }),
      cache: "no-store",
    }
  );

  if (!loginRes.ok) {
    const data = await loginRes.text();

    console.error("Drupal login error:", {
      status: loginRes.status,
      statusText: loginRes.statusText,
      data,
    });

    throw new Error("Greška pri prijavi na Drupal.");
  }

  const setCookie = loginRes.headers.get("set-cookie");

  if (!setCookie) {
    throw new Error(
      "Drupal nije vratio session cookie."
    );
  }

  const csrfRes = await fetch(
    `${DRUPAL_BASE_URL}/session/token`,
    {
      headers: {
        Cookie: setCookie,
      },
      cache: "no-store",
    }
  );

  if (!csrfRes.ok) {
    throw new Error(
      "Nije moguće dobiti Drupal CSRF token."
    );
  }

  const csrfToken = await csrfRes.text();

  return {
    cookie: setCookie,
    csrfToken,
  };
}

/**
 * Pronalazi Drupal UUID korisnika na osnovu UID-a.
 */
async function getDrupalUserUuid(
  uid: number,
  cookieHeader: string
): Promise<string> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/user/user` +
    `?filter[uid]=${encodeURIComponent(uid)}` +
    `&page[limit]=1`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const data: DrupalResponse = await res.json();

  if (!res.ok) {
    console.error(
      "Greška pri učitavanju Drupal korisnika:",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      data?.errors?.[0]?.detail ||
        data?.errors?.[0]?.title ||
        "Greška pri pronalaženju korisnika."
    );
  }

  const user = data.data?.[0];

  if (!user?.id) {
    throw new Error(
      "Drupal korisnik nije pronađen."
    );
  }

  return user.id;
}

/**
 * Provera da li reply postoji.
 */
async function checkReplyExists(
  replyId: string,
  cookieHeader: string
): Promise<boolean> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply/${replyId}`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    return false;
  }

  if (!res.ok) {
    const data: DrupalResponse = await res.json();

    console.error(
      "Greška pri proveri reply-ja:",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      data?.errors?.[0]?.detail ||
        data?.errors?.[0]?.title ||
        "Greška pri proveri odgovora."
    );
  }

  return true;
}

/**
 * Učitava forum_like zapise.
 *
 * NAMERNO nema:
 *
 * filter[field_reply.id]
 *
 * jer Drupal JSON:API kod nas ne dozvoljava
 * nested filtering preko field_reply.id.
 *
 * Umesto toga učitavamo relationship field_reply
 * i filtriramo u JavaScript-u.
 */
async function getReplyLikes(
  replyId: string,
  cookieHeader: string
): Promise<any[]> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/forum_like` +
    `?include=field_reply,field_user` +
    `&page[limit]=1000`;

  console.log("Loading forum likes:", url);

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  const data: DrupalResponse = await res.json();

  if (!res.ok) {
    console.error(
      "Greška pri učitavanju lajkova - Drupal odgovor:",
      JSON.stringify(data, null, 2)
    );

    throw new Error(
      data?.errors?.[0]?.detail ||
        data?.errors?.[0]?.title ||
        "Greška pri učitavanju lajkova."
    );
  }

  const likes = data.data || [];

  /**
   * Pronađi samo like zapise koji pripadaju
   * traženom forum reply-ju.
   *
   * field_reply može biti dostupan direktno
   * u relationships.
   */
  const filteredLikes = likes.filter((like: any) => {
    const relationshipId =
      like.relationships?.field_reply?.data?.id;

    return relationshipId === replyId;
  });

  return filteredLikes;
}

/**
 * Pronalazi postojeći lajk korisnika za određeni reply.
 */
async function findExistingLike(
  userUuid: string,
  replyId: string,
  cookieHeader: string
): Promise<any | null> {
  const likes = await getReplyLikes(
    replyId,
    cookieHeader
  );

  const existingLike = likes.find(
    (like: any) =>
      like.relationships?.field_user?.data?.id ===
      userUuid
  );

  return existingLike || null;
}

/**
 * GET
 *
 * Vraća:
 *
 * {
 *   likes: number,
 *   liked: boolean
 * }
 */
export async function GET(
  req: Request,
  context: {
    params: Promise<{
      replyId: string;
    }>;
  }
) {
  try {
    const { replyId } = await context.params;

    if (!replyId) {
      return NextResponse.json(
        {
          error: "Nedostaje ID odgovora.",
        },
        {
          status: 400,
        }
      );
    }

    const authUser = await getAuthUser();

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          error: "Niste prijavljeni.",
        },
        {
          status: 401,
        }
      );
    }

    const { cookie } = await loginToDrupal();

    const replyExists = await checkReplyExists(
      replyId,
      cookie
    );

    if (!replyExists) {
      return NextResponse.json(
        {
          error: "Odgovor ne postoji.",
        },
        {
          status: 404,
        }
      );
    }

    const likes = await getReplyLikes(
      replyId,
      cookie
    );

    const userUuid = await getDrupalUserUuid(
      authUser.uid,
      cookie
    );

    const liked = likes.some(
      (like: any) =>
        like.relationships?.field_user?.data?.id ===
        userUuid
    );

    return NextResponse.json({
      likes: likes.length,
      liked,
    });
  } catch (error) {
    console.error(
      "GET /api/forum/reply/[replyId]/like error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Greška pri učitavanju lajkova.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * POST
 *
 * Dodaje lajk.
 */
export async function POST(
  req: Request,
  context: {
    params: Promise<{
      replyId: string;
    }>;
  }
) {
  try {
    const { replyId } = await context.params;

    if (!replyId) {
      return NextResponse.json(
        {
          error: "Nedostaje ID odgovora.",
        },
        {
          status: 400,
        }
      );
    }

    const authUser = await getAuthUser();

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          error: "Niste prijavljeni.",
        },
        {
          status: 401,
        }
      );
    }

    const { cookie, csrfToken } =
      await loginToDrupal();

    const replyExists = await checkReplyExists(
      replyId,
      cookie
    );

    if (!replyExists) {
      return NextResponse.json(
        {
          error: "Odgovor ne postoji.",
        },
        {
          status: 404,
        }
      );
    }

    const userUuid = await getDrupalUserUuid(
      authUser.uid,
      cookie
    );

    /**
     * Proveravamo da li korisnik već ima lajk.
     */
    const existingLike =
      await findExistingLike(
        userUuid,
        replyId,
        cookie
      );

    if (existingLike) {
      const likes = await getReplyLikes(
        replyId,
        cookie
      );

      return NextResponse.json({
        likes: likes.length,
        liked: true,
      });
    }

    /**
     * Kreiramo novi forum_like node.
     */
    const createUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_like`;

    const createBody = {
      data: {
        type: "node--forum_like",

        attributes: {
          title: "Like",
          status: true,
        },

        relationships: {
          field_user: {
            data: {
              type: "user--user",
              id: userUuid,
            },
          },

          field_reply: {
            data: {
              type: "node--forum_reply",
              id: replyId,
            },
          },
        },
      },
    };

    console.log(
      "Creating forum like:",
      JSON.stringify(
        createBody,
        null,
        2
      )
    );

    const createRes = await fetch(
      createUrl,
      {
        method: "POST",

        headers: {
          Accept:
            "application/vnd.api+json",

          "Content-Type":
            "application/vnd.api+json",

          "X-CSRF-Token":
            csrfToken,

          Cookie: cookie,
        },

        body: JSON.stringify(
          createBody
        ),

        cache: "no-store",
      }
    );

    const createData: DrupalResponse =
      await createRes.json();

    if (!createRes.ok) {
      console.error(
        "Greška pri kreiranju lajka - Drupal odgovor:",
        JSON.stringify(
          createData,
          null,
          2
        )
      );

      throw new Error(
        createData?.errors?.[0]?.detail ||
          createData?.errors?.[0]?.title ||
          "Greška pri dodavanju lajka."
      );
    }

    const likes =
      await getReplyLikes(
        replyId,
        cookie
      );

    return NextResponse.json({
      likes: likes.length,
      liked: true,
    });
  } catch (error) {
    console.error(
      "POST /api/forum/reply/[replyId]/like error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Greška pri dodavanju lajka.",
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * DELETE
 *
 * Uklanja lajk.
 */
export async function DELETE(
  req: Request,
  context: {
    params: Promise<{
      replyId: string;
    }>;
  }
) {
  try {
    const { replyId } = await context.params;

    if (!replyId) {
      return NextResponse.json(
        {
          error: "Nedostaje ID odgovora.",
        },
        {
          status: 400,
        }
      );
    }

    const authUser = await getAuthUser();

    if (!authUser?.uid) {
      return NextResponse.json(
        {
          error: "Niste prijavljeni.",
        },
        {
          status: 401,
        }
      );
    }

    const { cookie, csrfToken } =
      await loginToDrupal();

    const userUuid =
      await getDrupalUserUuid(
        authUser.uid,
        cookie
      );

    const existingLike =
      await findExistingLike(
        userUuid,
        replyId,
        cookie
      );

    if (!existingLike) {
      const likes =
        await getReplyLikes(
          replyId,
          cookie
        );

      return NextResponse.json({
        likes: likes.length,
        liked: false,
      });
    }

    const likeId =
      existingLike.id;

    const deleteUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_like/${likeId}`;

    const deleteRes =
      await fetch(deleteUrl, {
        method: "DELETE",

        headers: {
          Accept:
            "application/vnd.api+json",

          "X-CSRF-Token":
            csrfToken,

          Cookie: cookie,
        },

        cache: "no-store",
      });

    if (!deleteRes.ok) {
      let deleteData: DrupalResponse =
        {};

      try {
        deleteData =
          await deleteRes.json();
      } catch {
        // DELETE može vratiti prazan odgovor.
      }

      console.error(
        "Greška pri brisanju lajka - Drupal odgovor:",
        JSON.stringify(
          deleteData,
          null,
          2
        )
      );

      throw new Error(
        deleteData?.errors?.[0]?.detail ||
          deleteData?.errors?.[0]?.title ||
          "Greška pri uklanjanju lajka."
      );
    }

    const likes =
      await getReplyLikes(
        replyId,
        cookie
      );

    return NextResponse.json({
      likes: likes.length,
      liked: false,
    });
  } catch (error) {
    console.error(
      "DELETE /api/forum/reply/[replyId]/like error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Greška pri uklanjanju lajka.",
      },
      {
        status: 500,
      }
    );
  }
}
