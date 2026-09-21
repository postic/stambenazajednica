// src/app/api/forum/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

interface AuthUser {
  uid: string;
  name: string;
  roles?: string[];
  picture?: string | null;
  broj?: string | null;
}

interface DrupalUser {
  id: string;
  type?: string;
  attributes?: {
    uid?: number;
    name?: string;
  };
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

function getRelationshipId(
  item: any,
  fieldName: string
): string | null {
  return item?.relationships?.[fieldName]?.data?.id || null;
}

function getRelationshipType(
  item: any,
  fieldName: string
): string | null {
  return item?.relationships?.[fieldName]?.data?.type || null;
}

function getFieldValue(
  item: any,
  fieldName: string
): any {
  return item?.attributes?.[fieldName] ?? null;
}

function normalizeParentType(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] || null;
  }

  if (typeof value === "object") {
    if (typeof value.value === "string") {
      return value.value;
    }

    if (typeof value.target_id === "string") {
      return value.target_id;
    }
  }

  return null;
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
    throw new Error(
      "Drupal session cookie nije pronađen."
    );
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
    throw new Error(
      "Drupal CSRF token nije pronađen."
    );
  }

  const csrfToken = await csrfResponse.text();

  return {
    cookieHeader,
    csrfToken,
  };
}

async function getDrupalUserUuid(
  uid: string,
  cookieHeader: string
): Promise<string | null> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/user/user` +
    `?filter[uid]=${encodeURIComponent(uid)}` +
    `&page[limit]=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.api+json",
      Cookie: cookieHeader,
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

  const user: DrupalUser | undefined =
    data?.data?.[0];

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

async function parseDrupalResponse(
  response: Response
) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    console.error(
      "Drupal nije vratio JSON:",
      text
    );

    throw new Error(
      `Drupal je vratio neispravan odgovor: ${text.substring(
        0,
        300
      )}`
    );
  }
}

function getAuthorName(
  item: any,
  includedUsers: Map<string, DrupalUser>
): string | null {
  const authorId = getRelationshipId(
    item,
    "uid"
  );

  if (!authorId) {
    return null;
  }

  const author = includedUsers.get(authorId);

  if (!author) {
    return null;
  }

  return author.attributes?.name || null;
}

function mapReply(
  item: any,
  includedUsers: Map<string, DrupalUser>
) {
  const parentId = getRelationshipId(
    item,
    "field_parent_id"
  );

  const parentJsonApiType =
    getRelationshipType(
      item,
      "field_parent_id"
    );

  const parentType = normalizeParentType(
    getFieldValue(
      item,
      "field_parent_type"
    )
  );

  const topicId = getRelationshipId(
    item,
    "field_topic"
  );

  const prostorId = getRelationshipId(
    item,
    "field_prostor"
  );

  const authorId = getRelationshipId(
    item,
    "uid"
  );

  const author = getAuthorName(
    item,
    includedUsers
  );

  return {
    id: item.id,

    title:
      getFieldValue(item, "title") ||
      "Odgovor",

    body:
      getFieldValue(item, "body")?.processed ||
      getFieldValue(item, "body")?.value ||
      "",

    created:
      getFieldValue(item, "created") ||
      null,

    changed:
      getFieldValue(item, "changed") ||
      null,

    parentId,

    parentType,

    parentJsonApiType,

    topic: topicId,

    prostor: prostorId,

    authorId,

    author,
  };
}

export async function GET(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: topicId } =
      await context.params;

    if (!topicId) {
      return NextResponse.json(
        {
          error:
            "ID teme nije prosleđen.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------
     * TEMA
     * ----------------------------------------
     */

    const topicUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic/${topicId}`;

    const topicResponse = await fetch(
      topicUrl,
      {
        method: "GET",
        headers: {
          Accept:
            "application/vnd.api+json",
        },
        cache: "no-store",
      }
    );

    const topicData =
      await parseDrupalResponse(
        topicResponse
      );

    if (!topicResponse.ok) {
      console.error(
        "Drupal forum topic error:",
        topicData
      );

      return NextResponse.json(
        {
          error:
            "Tema nije pronađena.",
          details: topicData,
        },
        {
          status:
            topicResponse.status,
        }
      );
    }

    const topic =
      topicData.data;

    if (!topic) {
      return NextResponse.json(
        {
          error:
            "Tema nije pronađena.",
        },
        { status: 404 }
      );
    }

    /*
     * ----------------------------------------
     * ODGOVORI
     * ----------------------------------------
     *
     * include=uid omogućava da Drupal
     * vrati podatke o autorima odgovora
     * u "included" delu JSON:API odgovora.
     */

    const repliesUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply` +
      `?sort=created` +
      `&page[limit]=1000` +
      `&include=uid`;

    const repliesResponse =
      await fetch(
        repliesUrl,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.api+json",
          },
          cache: "no-store",
        }
      );

    const repliesData =
      await parseDrupalResponse(
        repliesResponse
      );

    if (!repliesResponse.ok) {
      console.error(
        "Drupal forum replies error:",
        repliesData
      );

      return NextResponse.json(
        {
          error:
            "Greška pri učitavanju odgovora.",
          details: repliesData,
        },
        {
          status:
            repliesResponse.status,
        }
      );
    }

    /*
     * ----------------------------------------
     * AUTORI
     * ----------------------------------------
     */

    const includedUsers =
      new Map<string, DrupalUser>();

    if (
      Array.isArray(
        repliesData.included
      )
    ) {
      for (const item of repliesData.included) {
        if (
          item?.type === "user--user" &&
          item?.id
        ) {
          includedUsers.set(
            item.id,
            item
          );
        }
      }
    }

    console.log(
      "FORUM INCLUDED USERS:",
      Array.from(
        includedUsers.entries()
      ).map(
        ([id, user]) => ({
          id,
          name:
            user.attributes?.name,
        })
      )
    );

    /*
     * ----------------------------------------
     * MAPIRANJE ODGOVORA
     * ----------------------------------------
     */

    const allReplies =
      Array.isArray(
        repliesData.data
      )
        ? repliesData.data.map(
            (item: any) =>
              mapReply(
                item,
                includedUsers
              )
          )
        : [];

    console.log(
      "ALL FORUM REPLIES:",
      allReplies
    );

    /*
     * ----------------------------------------
     * PRONALAŽENJE ODGOVORA KOJI PRIPADAJU TEMI
     * ----------------------------------------
     */

    const repliesMap =
      new Map<string, any>();

    for (const reply of allReplies) {
      repliesMap.set(
        reply.id,
        reply
      );
    }

    const topicReplies: any[] = [];

    for (const reply of allReplies) {
      /*
       * Direktan odgovor na temu.
       */
      if (
        reply.parentId ===
        topicId
      ) {
        topicReplies.push(
          reply
        );

        continue;
      }

      /*
       * Odgovor na odgovor.
       * Idemo kroz roditelje dok ne
       * pronađemo temu.
       */

      let currentParentId =
        reply.parentId;

      const visited =
        new Set<string>();

      let belongsToTopic =
        false;

      for (
        let i = 0;
        i < 50;
        i++
      ) {
        if (!currentParentId) {
          break;
        }

        if (
          currentParentId ===
          topicId
        ) {
          belongsToTopic = true;
          break;
        }

        if (
          visited.has(
            currentParentId
          )
        ) {
          break;
        }

        visited.add(
          currentParentId
        );

        const parentReply =
          repliesMap.get(
            currentParentId
          );

        if (!parentReply) {
          break;
        }

        currentParentId =
          parentReply.parentId;
      }

      if (belongsToTopic) {
        topicReplies.push(
          reply
        );
      }
    }

    /*
     * Hronološki redosled.
     */

    topicReplies.sort(
      (a, b) => {
        const aTime =
          a.created
            ? new Date(
                a.created
              ).getTime()
            : 0;

        const bTime =
          b.created
            ? new Date(
                b.created
              ).getTime()
            : 0;

        return aTime - bTime;
      }
    );

    console.log(
      "TOPIC REPLIES:",
      topicReplies
    );

    /*
     * ----------------------------------------
     * TEMA RESPONSE
     * ----------------------------------------
     */

    const topicResult = {
      id: topic.id,

      title:
        topic.attributes?.title ||
        "Tema",

      body:
        topic.attributes?.body
          ?.processed ||
        topic.attributes?.body
          ?.value ||
        "",

      created:
        topic.attributes?.created ||
        null,

      changed:
        topic.attributes?.changed ||
        null,

      prostor:
        getRelationshipId(
          topic,
          "field_prostor"
        ),

      likes: Number(
        topic.attributes
          ?.field_likes || 0
      ),
    };

    return NextResponse.json({
      topic: topicResult,
      replies: topicReplies,
    });
  } catch (error) {
    console.error(
      "GET /api/forum/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Greška pri učitavanju teme.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id: topicId } =
      await context.params;

    if (!topicId) {
      return NextResponse.json(
        {
          error:
            "ID teme nije prosleđen.",
        },
        { status: 400 }
      );
    }

    const authUser =
      getNextAuthUser(req);

    if (!authUser) {
      return NextResponse.json(
        {
          error:
            "Morate biti prijavljeni.",
        },
        { status: 401 }
      );
    }

    console.log(
      "FORUM AUTH USER:",
      authUser
    );

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Neispravan JSON zahtev.",
        },
        { status: 400 }
      );
    }

    const text =
      typeof body.body === "string"
        ? body.body.trim()
        : "";

    const parentId =
      typeof body.parentId ===
        "string" &&
      body.parentId.trim() !== ""
        ? body.parentId.trim()
        : null;

    if (!text) {
      return NextResponse.json(
        {
          error:
            "Odgovor ne može biti prazan.",
        },
        { status: 400 }
      );
    }

    /*
     * Login Drupal API korisnika.
     */

    const {
      cookieHeader,
      csrfToken,
    } = await loginToDrupal();

    /*
     * Pronađi UUID trenutno prijavljenog
     * korisnika iz next_auth cookie-ja.
     */

    const userUuid =
      await getDrupalUserUuid(
        authUser.uid,
        cookieHeader
      );

    if (!userUuid) {
      return NextResponse.json(
        {
          error:
            "Drupal korisnik prijavljen u Komšija aplikaciji nije pronađen.",
        },
        { status: 404 }
      );
    }

    console.log(
      "FORUM REPLY USER UID:",
      authUser.uid
    );

    console.log(
      "FORUM REPLY USER UUID:",
      userUuid
    );

    /*
     * ----------------------------------------
     * PROVERA TEME
     * ----------------------------------------
     */

    const topicUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/forum_topic/${topicId}`;

    const topicResponse =
      await fetch(
        topicUrl,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.api+json",
            Cookie: cookieHeader,
          },
          cache: "no-store",
        }
      );

    const topicData =
      await parseDrupalResponse(
        topicResponse
      );

    if (!topicResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Tema nije pronađena.",
          details: topicData,
        },
        {
          status:
            topicResponse.status,
        }
      );
    }

    /*
     * ----------------------------------------
     * RODITELJ ODGOVORA
     * ----------------------------------------
     */

    let finalParentId =
      topicId;

    let finalParentType =
      "topic";

    let finalParentJsonApiType =
      "node--forum_topic";

    if (parentId) {
      const parentUrl =
        `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply/${parentId}`;

      const parentResponse =
        await fetch(
          parentUrl,
          {
            method: "GET",
            headers: {
              Accept:
                "application/vnd.api+json",
              Cookie: cookieHeader,
            },
            cache: "no-store",
          }
        );

      const parentData =
        await parseDrupalResponse(
          parentResponse
        );

      if (
        !parentResponse.ok ||
        !parentData.data
      ) {
        return NextResponse.json(
          {
            error:
              "Roditeljski odgovor nije pronađen.",
            details:
              parentData,
          },
          {
            status:
              parentResponse.ok
                ? 404
                : parentResponse.status,
          }
        );
      }

      /*
       * Učitavamo sve odgovore da proverimo
       * da roditelj zaista pripada ovoj temi.
       */

      const allRepliesResponse =
        await fetch(
          `${DRUPAL_BASE_URL}/jsonapi/node/forum_reply?page[limit]=1000`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/vnd.api+json",
              Cookie: cookieHeader,
            },
            cache: "no-store",
          }
        );

      const allRepliesData =
        await parseDrupalResponse(
          allRepliesResponse
        );

      const allReplies =
        Array.isArray(
          allRepliesData.data
        )
          ? allRepliesData.data
          : [];

      const replyMap =
        new Map<string, any>();

      for (const item of allReplies) {
        replyMap.set(
          item.id,
          item
        );
      }

      let currentId =
        parentId;

      let belongsToTopic =
        false;

      const visited =
        new Set<string>();

      for (
        let i = 0;
        i < 50;
        i++
      ) {
        if (!currentId) {
          break;
        }

        if (
          currentId ===
          topicId
        ) {
          belongsToTopic = true;
          break;
        }

        if (
          visited.has(
            currentId
          )
        ) {
          break;
        }

        visited.add(
          currentId
        );

        const current =
          replyMap.get(
            currentId
          );

        if (!current) {
          break;
        }

        const currentParentId =
          getRelationshipId(
            current,
            "field_parent_id"
          );

        if (
          currentParentId ===
          topicId
        ) {
          belongsToTopic = true;
          break;
        }

        currentId =
          currentParentId;
      }

      if (!belongsToTopic) {
        return NextResponse.json(
          {
            error:
              "Odgovor na koji pokušavate da odgovorite ne pripada ovoj temi.",
          },
          { status: 400 }
        );
      }

      finalParentId =
        parentId;

      finalParentType =
        "reply";

      finalParentJsonApiType =
        "node--forum_reply";
    }

    /*
     * ----------------------------------------
     * KREIRANJE ODGOVORA
     * ----------------------------------------
     *
     * UID je eksplicitno postavljen na
     * trenutno prijavljenog korisnika.
     */

    const replyPayload = {
      data: {
        type: "node--forum_reply",

        attributes: {
          title: "Odgovor",

          body: {
            value: text,
            format: "basic_html",
          },

          field_parent_type:
            finalParentType,
        },

        relationships: {
          uid: {
            data: {
              type: "user--user",
              id: userUuid,
            },
          },

          field_parent_id: {
            data: {
              type:
                finalParentJsonApiType,
              id: finalParentId,
            },
          },
        },
      },
    };

    console.log(
      "Creating forum reply:",
      JSON.stringify(
        replyPayload,
        null,
        2
      )
    );

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

            Cookie:
              cookieHeader,

            "X-CSRF-Token":
              csrfToken,
          },

          body: JSON.stringify(
            replyPayload
          ),

          cache: "no-store",
        }
      );

    const createData =
      await parseDrupalResponse(
        createResponse
      );

    if (!createResponse.ok) {
      console.error(
        "Create forum reply error:",
        createData
      );

      return NextResponse.json(
        {
          error:
            createData?.errors?.[0]
              ?.detail ||
            "Greška pri kreiranju odgovora.",

          details:
            createData,
        },
        {
          status:
            createResponse.status,
        }
      );
    }

    const createdReply =
      createData.data;

    /*
     * ----------------------------------------
     * RESPONSE NOVOG ODGOVORA
     * ----------------------------------------
     */

    const createdParentId =
      getRelationshipId(
        createdReply,
        "field_parent_id"
      ) ||
      finalParentId;

    const createdParentJsonApiType =
      getRelationshipType(
        createdReply,
        "field_parent_id"
      ) ||
      finalParentJsonApiType;

    const createdParentType =
      normalizeParentType(
        getFieldValue(
          createdReply,
          "field_parent_type"
        )
      ) ||
      finalParentType;

    /*
     * Autor je poznat odmah jer smo upravo
     * postavili userUuid.
     *
     * Za response koristimo authUser.name,
     * dok će sledeći GET svakako učitati
     * stvarno ime iz Drupal-a.
     */

    const reply = {
      id: createdReply.id,

      title:
        createdReply.attributes?.title ||
        "Odgovor",

      body:
        createdReply.attributes?.body
          ?.processed ||
        createdReply.attributes?.body
          ?.value ||
        text,

      created:
        createdReply.attributes?.created ||
        new Date().toISOString(),

      changed:
        createdReply.attributes?.changed ||
        null,

      parentId:
        createdParentId,

      parentType:
        createdParentType,

      parentJsonApiType:
        createdParentJsonApiType,

      topic:
        topicId,

      prostor:
        getRelationshipId(
          createdReply,
          "field_prostor"
        ),

      authorId:
        userUuid,

      author:
        authUser.name || null,
    };

    return NextResponse.json(
      {
        success: true,
        reply,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/forum/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Greška pri kreiranju odgovora.",
      },
      { status: 500 }
    );
  }
}
