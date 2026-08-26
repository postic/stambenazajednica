import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// =========================================================
// TYPES
// =========================================================

interface KontaktBody {
  ime?: string;
  email?: string;
  predmet?: string;
  poruka?: string;
}

// =========================================================
// HTML SANITIZACIJA
// =========================================================

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// =========================================================
// EMAIL VALIDACIJA
// =========================================================

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =========================================================
// POST
// =========================================================

export async function POST(request: Request) {
  try {
    // =======================================================
    // PARSIRANJE REQUESTA
    // =======================================================

    let body: KontaktBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Neispravan zahtev.",
        },
        { status: 400 }
      );
    }

    const ime = String(body.ime ?? "").trim();
    const email = String(body.email ?? "").trim();
    const predmet = String(body.predmet ?? "").trim();
    const poruka = String(body.poruka ?? "").trim();

    // =======================================================
    // VALIDACIJA OBAVEZNIH POLJA
    // =======================================================

    if (!ime || !email || !predmet || !poruka) {
      return NextResponse.json(
        {
          success: false,
          error: "Sva polja su obavezna.",
        },
        { status: 400 }
      );
    }

    // =======================================================
    // VALIDACIJA EMAILA
    // =======================================================

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unesite ispravnu email adresu.",
        },
        { status: 400 }
      );
    }

    // =======================================================
    // OGRANIČENJE DUŽINE
    // =======================================================

    if (ime.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Ime je predugačko.",
        },
        { status: 400 }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        {
          success: false,
          error: "Email adresa je predugačka.",
        },
        { status: 400 }
      );
    }

    if (predmet.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: "Predmet je predugačak.",
        },
        { status: 400 }
      );
    }

    if (poruka.length > 10000) {
      return NextResponse.json(
        {
          success: false,
          error: "Poruka je predugačka.",
        },
        { status: 400 }
      );
    }

    // =======================================================
    // ENV PROVERA
    // =======================================================

    const gmailUser = process.env.GMAIL_USER?.trim();
    const gmailAppPassword =
      process.env.GMAIL_APP_PASSWORD?.trim();
    const upravnikEmail =
      process.env.UPRAVNIK_EMAIL?.trim();

    if (!gmailUser) {
      console.error(
        "KONTAKT EMAIL ERROR: GMAIL_USER nije podešen."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email servis nije pravilno konfigurisan.",
        },
        { status: 500 }
      );
    }

    if (!gmailAppPassword) {
      console.error(
        "KONTAKT EMAIL ERROR: GMAIL_APP_PASSWORD nije podešen."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email servis nije pravilno konfigurisan.",
        },
        { status: 500 }
      );
    }

    if (!upravnikEmail) {
      console.error(
        "KONTAKT EMAIL ERROR: UPRAVNIK_EMAIL nije podešen."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email servis nije pravilno konfigurisan.",
        },
        { status: 500 }
      );
    }

    // =======================================================
    // PROVERA UPRAVNIK EMAILA
    // =======================================================

    if (!isValidEmail(upravnikEmail)) {
      console.error(
        "KONTAKT EMAIL ERROR: UPRAVNIK_EMAIL nije validan:",
        upravnikEmail
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email adresa upravnika nije pravilno podešena.",
        },
        { status: 500 }
      );
    }

    // =======================================================
    // GMAIL SMTP TRANSPORTER
    // =======================================================

    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // =======================================================
    // SMTP PROVERA
    // =======================================================

    try {
      await transporter.verify();

      console.log(
        "KONTAKT EMAIL: Gmail SMTP konekcija uspešna."
      );
    } catch (smtpError: unknown) {
      console.error(
        "KONTAKT SMTP VERIFY ERROR:",
        smtpError
      );

      const error = smtpError as {
        code?: string;
        responseCode?: number;
        response?: string;
        command?: string;
      };

      if (
        error.responseCode === 535 ||
        error.code === "EAUTH"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gmail prijava nije prihvaćena. Proverite GMAIL_USER i GMAIL_APP_PASSWORD.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Nije moguće povezati se sa Gmail SMTP serverom.",
        },
        { status: 500 }
      );
    }

    // =======================================================
    // HTML ESCAPE
    // =======================================================

    const safeIme = escapeHtml(ime);
    const safeEmail = escapeHtml(email);
    const safePredmet = escapeHtml(predmet);
    const safePoruka = escapeHtml(poruka).replace(
      /\r?\n/g,
      "<br>"
    );

    // =======================================================
    // TEXT EMAIL
    // =======================================================

    const text = `
Nova poruka sa kontakt forme.

Ime: ${ime}
Email: ${email}
Predmet: ${predmet}

Poruka:
${poruka}
    `.trim();

    // =======================================================
    // HTML EMAIL
    // =======================================================

    const html = `
      <!DOCTYPE html>
      <html lang="sr">
        <head>
          <meta charset="UTF-8">
          <title>Nova poruka sa kontakt forme</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 24px;
            background: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
            color: #222;
          "
        >

          <div
            style="
              max-width: 700px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-radius: 10px;
              padding: 30px;
            "
          >

            <h2
              style="
                margin-top: 0;
                margin-bottom: 24px;
              "
            >
              Nova poruka sa kontakt forme
            </h2>

            <div style="margin-bottom: 18px;">
              <strong>Ime:</strong>
              <div style="margin-top: 4px;">
                ${safeIme}
              </div>
            </div>

            <div style="margin-bottom: 18px;">
              <strong>Email:</strong>
              <div style="margin-top: 4px;">
                ${safeEmail}
              </div>
            </div>

            <div style="margin-bottom: 18px;">
              <strong>Predmet:</strong>
              <div style="margin-top: 4px;">
                ${safePredmet}
              </div>
            </div>

            <div>
              <strong>Poruka:</strong>

              <div
                style="
                  margin-top: 8px;
                  padding: 15px;
                  background: #f7f7f7;
                  border-radius: 6px;
                  white-space: normal;
                "
              >
                ${safePoruka}
              </div>
            </div>

          </div>

        </body>
      </html>
    `;

    // =======================================================
    // SLANJE EMAILA
    // =======================================================

    try {
      const info = await transporter.sendMail({
        from: `"Kontakt forma" <${gmailUser}>`,

        to: upravnikEmail,

        replyTo: email,

        subject: `Kontakt forma: ${predmet}`,

        text,

        html,
      });

      console.log(
        "KONTAKT EMAIL: Poruka uspešno poslata.",
        {
          messageId: info.messageId,
          to: upravnikEmail,
        }
      );
    } catch (sendError: unknown) {
      console.error(
        "KONTAKT SENDMAIL ERROR:",
        sendError
      );

      const error = sendError as {
        code?: string;
        responseCode?: number;
        response?: string;
        command?: string;
      };

      if (
        error.responseCode === 535 ||
        error.code === "EAUTH"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Gmail nije prihvatio prijavu. Proverite GMAIL_USER i GMAIL_APP_PASSWORD.",
          },
          { status: 500 }
        );
      }

      if (error.code === "EENVELOPE") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Email adresa primaoca ili pošiljaoca nije validna.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error:
            "Došlo je do greške prilikom slanja emaila.",
        },
        { status: 500 }
      );
    }

    // =======================================================
    // SUCCESS
    // =======================================================

    return NextResponse.json({
      success: true,
      message: "Poruka je uspešno poslata.",
    });
  } catch (error) {
    console.error(
      "KONTAKT EMAIL UNEXPECTED ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Došlo je do neočekivane greške prilikom obrade poruke.",
      },
      { status: 500 }
    );
  }
}
