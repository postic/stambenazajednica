import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const username = body?.username?.trim();
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Unesite korisničko ime i lozinku.",
        },
        { status: 400 }
      );
    }

    const drupalBaseUrl =
      process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

    if (!drupalBaseUrl) {
      return NextResponse.json(
        {
          message: "Drupal URL nije podešen.",
        },
        { status: 500 }
      );
    }

    const drupalRes = await fetch(
      `${drupalBaseUrl}/user/login?_format=json`,
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
      }
    );

    const data = await drupalRes.json();

    if (!drupalRes.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ||
            "Neispravno korisničko ime ili lozinka.",
        },
        {
          status: drupalRes.status,
        }
      );
    }

    const currentUser = data?.current_user;

    if (!currentUser?.uid) {
      return NextResponse.json(
        {
          message: "Prijava nije uspela.",
        },
        { status: 401 }
      );
    }

    const roles = currentUser.roles || [];

    /*
     * Upravnik mora imati Drupal rolu "upravnik".
     */
    if (!roles.includes("upravnik")) {
      return NextResponse.json(
        {
          message:
            "Ovaj nalog nema dozvolu za pristup delu za upravnike.",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      user: {
        uid: currentUser.uid,
        name: currentUser.name,
        roles,
      },
    });

    /*
     * NEXT SESSION
     */
    res.cookies.set({
      name: "next_auth",
      value: JSON.stringify({
        uid: currentUser.uid,
        name: currentUser.name,
        roles,
      }),
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    /*
     * DRUPAL SESSION COOKIE
     */
    const setCookies = drupalRes.headers.getSetCookie();

    for (const cookie of setCookies) {
      const cookiePair = cookie.split(";")[0];

      const separatorIndex = cookiePair.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const name = cookiePair
        .slice(0, separatorIndex)
        .trim();

      const value = cookiePair
        .slice(separatorIndex + 1)
        .trim();

      if (!name || !value) {
        continue;
      }

      res.cookies.set({
        name,
        value,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    /*
     * CSRF TOKEN
     *
     * Sačuvaj ga za kasnije upravničke POST/PATCH/DELETE
     * operacije prema Drupalu.
     */
    if (data?.csrf_token) {
      res.cookies.set({
        name: "drupal_csrf_token",
        value: data.csrf_token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    if (data?.logout_token) {
      res.cookies.set({
        name: "drupal_logout_token",
        value: data.logout_token,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("Upravnik login error:", error);

    return NextResponse.json(
      {
        message: "Greška prilikom prijave.",
      },
      { status: 500 }
    );
  }
}
