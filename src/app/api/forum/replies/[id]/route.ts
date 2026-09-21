import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

interface DrupalUser {
  id: string;
  attributes?: {
    uid?: number;
    name?: string;
  };
}

async function getDrupalUserUuid(
  uid: number,
  drupalCookies: string
): Promise<string | null> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/user/user` +
    `?filter[uid]=${encodeURIComponent(String(uid))}` +
    `&page[limit]=1`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: drupalCookies,
    },
    cache: "no-store",
  });

  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error(
      "Greška pri pronalaženju Drupal korisnika:",
      response.status,
      text
    );

    return null;
  }

  const user: DrupalUser | undefined = data?.data?.[0];

  if (!user?.id) {
    console.error(
      "Drupal korisnik nije pronađen za UID:",
      uid
    );

    return null;
  }

  console.log(
    "Drupal korisnik:",
    uid,
    "→ UUID:",
    user.id
  );

  return user.id;
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // ----------------------------------------------
    // 1. Topic ID
    // ----------------------------------------------

    const { id: topicId } = await context.params;

    if (!topicId) {
      return NextResponse.json(
        {
          error: "Tema nije pronađena.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 2. Podaci iz forme
    // ----------------------------------------------

    const { body, parentId } = await request.json();

    const cleanBody =
      body?.toString().trim() || "";

    const cleanParentId = parentId
      ? parentId.toString().trim()
      : "";

    // ----------------------------------------------
    // 3. Validacija
    // ----------------------------------------------

    if (!cleanBody) {
      return NextResponse.json(
        {
          error: "Tekst odgovora je obavezan.",
        },
        {
          status: 400,
        }
      );
    }

    // ----------------------------------------------
    // 4. next_auth
    // ----------------------------------------------

    const cookieStore = await cookies();

    const nextAuthCookie =
      cookieStore.get("next_auth");

    if (!nextAuthCookie?.value) {
      return NextResponse.json(
        {
          error: "Niste prijavljeni.",
        },
        {
          status: 401,
        }
      );
    }

    let authUser: {
      uid?: number;
      name?: string;
      roles?: string[];
      picture?: string | null;
      broj?: string | null;
    };

    try {
      authUser = JSON.parse(
        decodeURIComponent(
          nextAuthCookie.value
        )
      );
    } catch (error) {
      console.error(
        "Greška pri čitanju next_auth:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Sesija korisnika nije ispravna.",
        },
        {
          status: 401,
        }
      );
    }

    if (!authUser.uid) {
      return NextResponse.json(
        {
          error:
            "UID korisnika nije pronađen.",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "FORUM AUTH USER:",
      authUser
    );

    // ----------------------------------------------
    // 5. Drupal cookies
    // ----------------------------------------------

    const drupalCookies =
      cookieStore
        .getAll()
        .filter(
          (cookie) =>
            cookie.name.startsWith("SESS") ||
            cookie.name.startsWith("SSESS")
        )
        .map(
          (cookie) =>
            `${cookie.name}=${cookie.value}`
        )
        .join("; ");

    if (!drupalCookies) {
      return NextResponse.json(
        {
          error:
            "Drupal sesija nije pronađena.",
        },
        {
          status: 401,
        }
      );
    }

    // ----------------------------------------------
    // 6. CSRF token
    // ----------------------------------------------

    const csrfResponse = await fetch(
      `${DRUPAL_BASE_URL}/session/token`,
      {
        headers: {
          Cookie: drupalCookies,
        },
        cache: "no-store",
      }
    );

    if (!csrfResponse.ok) {
      const text =
        await csrfResponse.text();

      console.error(
        "Greška pri dohvatanju CSRF tokena:",
        text
      );

      return NextResponse.json(
        {
          error:
            "Nije moguće dobiti Drupal CSRF token.",
          details: text,
        },
        {
          status:
            csrfResponse.status,
        }
      );
    }

    const csrfToken =
      await csrfResponse.text();

    // ----------------------------------------------
    // 7. Pronađi JSON:API UUID korisnika
    // ----------------------------------------------

    const userUuid =
      await getDrupalUserUuid(
        authUser.uid,
        drupalCookies
      );

    if (!userUuid) {
      return NextResponse.json(
        {
          error:
            "Drupal korisnik nije pronađen.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------
    // 8. Provera teme
    // ----------------------------------------------

    const topicResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic/${topicId}`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",
            Cookie: drupalCookies,
          },
          cache: "no-store",
        }
      );

    const topicText =
      await topicResponse.text();

    let topicData: any = null;

    try {
      topicData = topicText
        ? JSON.parse(topicText)
        : null;
    } catch {
      topicData = null;
    }

    if (
      !topicResponse.ok ||
      !topicData?.data?.id
    ) {
      console.error(
        "Tema nije pronađena:",
        topicText
      );

      return NextResponse.json(
        {
          error:
            "Tema nije pronađena.",
        },
        {
          status: 404,
        }
      );
    }

    // ----------------------------------------------
    // 9. Parent
    // ----------------------------------------------

    let parentRelationship;

    if (cleanParentId) {
      const parentResponse =
        await fetch(
          `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply/${cleanParentId}`,
          {
            headers: {
              Accept:
                "application/vnd.api+json",
              Cookie: drupalCookies,
            },
            cache: "no-store",
          }
        );

      const parentText =
        await parentResponse.text();

      let parentData: any = null;

      try {
        parentData = parentText
          ? JSON.parse(parentText)
          : null;
      } catch {
        parentData = null;
      }

      if (
        !parentResponse.ok ||
        !parentData?.data?.id
      ) {
        return NextResponse.json(
          {
            error:
              "Odgovor na koji želite da odgovorite ne postoji.",
          },
          {
            status: 404,
          }
        );
      }

      const parentTopicId =
        parentData?.data?.relationships
          ?.field_topic?.data?.id;

      if (
        parentTopicId &&
        parentTopicId !== topicId
      ) {
        return NextResponse.json(
          {
            error:
              "Odgovor ne pripada ovoj temi.",
          },
          {
            status: 400,
          }
        );
      }

      parentRelationship = {
        data: {
          type: "node--forum_reply",
          id: cleanParentId,
        },
      };
    } else {
      parentRelationship = {
        data: {
          type: "node--forum_topic",
          id: topicId,
        },
      };
    }

    // ----------------------------------------------
    // 10. Kreiranje odgovora
    // ----------------------------------------------

    const payload = {
      data: {
        type: "node--forum_reply",

        attributes: {
          title: "Odgovor",

          body: {
            value: cleanBody,
            format: "plain_text",
          },
        },

        relationships: {
          uid: {
            data: {
              type: "user--user",
              id: userUuid,
            },
          },

          field_topic: {
            data: {
              type: "node--forum_topic",
              id: topicId,
            },
          },

          field_parent_id:
            parentRelationship,
        },
      },
    };

    console.log(
      "===================================="
    );

    console.log(
      "FORUM REPLY - KREIRANJE"
    );

    console.log(
      "UID:",
      authUser.uid
    );

    console.log(
      "USER UUID:",
      userUuid
    );

    console.log(
      "PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "===================================="
    );

    // ----------------------------------------------
    // 11. Kreiranje Drupal node-a
    // ----------------------------------------------

    const createResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/vnd.api+json",

            "Content-Type":
              "application/vnd.api+json",

            Cookie: drupalCookies,

            "X-CSRF-Token":
              csrfToken,
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

    // ----------------------------------------------
    // 12. Drupal odgovor
    // ----------------------------------------------

    const responseText =
      await createResponse.text();

    let responseData: any = null;

    try {
      responseData =
        responseText
          ? JSON.parse(responseText)
          : null;
    } catch {
      responseData = null;
    }

    if (!createResponse.ok) {
      console.error(
        "Drupal greška pri kreiranju odgovora:",
        createResponse.status,
        responseText
      );

      return NextResponse.json(
        {
          error:
            responseData?.errors?.[0]
              ?.detail ||
            responseData?.message ||
            "Greška pri kreiranju odgovora.",

          details:
            responseData ??
            responseText,
        },
        {
          status:
            createResponse.status,
        }
      );
    }

    // ----------------------------------------------
    // 13. Provera kreiranog node-a
    // ----------------------------------------------

    const nodeData =
      responseData?.data;

    if (!nodeData?.id) {
      return NextResponse.json(
        {
          error:
            "Odgovor je kreiran, ali Drupal nije vratio UUID.",
        },
        {
          status: 500,
        }
      );
    }

    // ----------------------------------------------
    // 14. Provera autora
    // ----------------------------------------------

    const verifyResponse =
      await fetch(
        `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply/${nodeData.id}?include=uid`,
        {
          headers: {
            Accept:
              "application/vnd.api+json",

            Cookie: drupalCookies,
          },

          cache: "no-store",
        }
      );

    const verifyText =
      await verifyResponse.text();

    let verifyData: any = null;

    try {
      verifyData =
        verifyText
          ? JSON.parse(verifyText)
          : null;
    } catch {
      verifyData = null;
    }

    if (
      verifyResponse.ok &&
      verifyData
    ) {
      const authorRelationship =
        verifyData?.data
          ?.relationships
          ?.uid
          ?.data;

      const authorUuid =
        authorRelationship?.id ||
        null;

      const includedUser =
        verifyData?.included?.find(
          (item: any) =>
            item.type === "user--user" &&
            item.id === authorUuid
        );

      const authorName =
        includedUser
          ?.attributes?.name ||
        null;

      console.log(
        "===================================="
      );

      console.log(
        "DRUPAL KREIRANI REPLY"
      );

      console.log(
        "REPLY UUID:",
        nodeData.id
      );

      console.log(
        "OČEKIVANI UUID:",
        userUuid
      );

      console.log(
        "STVARNI AUTHOR UUID:",
        authorUuid
      );

      console.log(
        "STVARNI AUTHOR NAME:",
        authorName
      );

      console.log(
        "===================================="
      );

      if (
        authorUuid !== userUuid
      ) {
        console.error(
          "⚠️ DRUPAL NIJE POSTAVIO OČEKIVANOG AUTORA!"
        );
      }
    } else {
      console.error(
        "Nije moguće proveriti autora:",
        verifyText
      );
    }

    // ----------------------------------------------
    // 15. Uspeh
    // ----------------------------------------------

    console.log(
      "Forum odgovor uspešno kreiran:",
      nodeData.id
    );

    return NextResponse.json({
      success: true,
      data: nodeData,
    });
  } catch (error) {
    console.error(
      "Greška pri POST /api/forum/replies/[id]:",
      error
    );

    return NextResponse.json(
      {
        error: "Greška na serveru.",
        details: String(error),
      },
      {
        status: 500,
      }
    );
  }
}
