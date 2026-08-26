import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const {
      ime,
      email,
      predmet,
      poruka,
    } = body;

    // =========================================================
    // VALIDACIJA
    // =========================================================

    if (
      !ime ||
      !email ||
      !predmet ||
      !poruka
    ) {
      return NextResponse.json(
        {
          error:
            "Sva polja su obavezna.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // ENV PROVERA
    // =========================================================

    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD ||
      !process.env.UPRAVNIK_EMAIL
    ) {
      console.error(
        "Kontakt API: nedostaju Gmail SMTP podešavanja."
      );

      return NextResponse.json(
        {
          error:
            "Slanje poruka trenutno nije podešeno.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================================================
    // GMAIL SMTP
    // =========================================================

    const transporter =
      nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

    // =========================================================
    // EMAIL
    // =========================================================

    await transporter.sendMail({
      from: `"Kontakt forma" <${process.env.GMAIL_USER}>`,
      to: process.env.UPRAVNIK_EMAIL,
      from: email,
      subject: `Kontakt forma: ${predmet}`,
      text: `
Nova poruka sa kontakt forme.

Ime i prezime:
${ime}

Email:
${email}

Predmet:
${predmet}

Poruka:
${poruka}
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Nova poruka sa kontakt forme</h2>

          <p>
            <strong>Ime i prezime:</strong><br>
            ${ime}
          </p>

          <p>
            <strong>Email:</strong><br>
            ${email}
          </p>

          <p>
            <strong>Predmet:</strong><br>
            ${predmet}
          </p>

          <p>
            <strong>Poruka:</strong><br>
            ${poruka.replace(/\n/g, "<br>")}
          </p>
        </div>
      `,
    });

    // =========================================================
    // SUCCESS
    // =========================================================

    return NextResponse.json({
      success: true,
      message:
        "Poruka je uspešno poslata.",
    });
  } catch (error) {
    console.error(
      "Kontakt API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Došlo je do greške pri slanju poruke.",
      },
      {
        status: 500,
      }
    );
  }
}
