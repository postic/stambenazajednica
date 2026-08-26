import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
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

    if (!ime || !email || !predmet || !poruka) {
      return NextResponse.json(
        {
          success: false,
          error: "Sva polja su obavezna.",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // ENV PROVERA
    // =========================================================

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const upravnikEmail = process.env.UPRAVNIK_EMAIL;

    if (!gmailUser || !gmailAppPassword || !upravnikEmail) {
      console.error(
        "Nedostaju GMAIL_USER, GMAIL_APP_PASSWORD ili UPRAVNIK_EMAIL."
      );

      return NextResponse.json(
        {
          success: false,
          error: "Email servis nije pravilno konfigurisan.",
        },
        { status: 500 }
      );
    }

    // =========================================================
    // GMAIL SMTP
    // =========================================================

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // =========================================================
    // SLANJE EMAILA
    // =========================================================

    await transporter.sendMail({
      from: `"Kontakt forma" <${gmailUser}>`,
      to: upravnikEmail,

      // Kada upravnik klikne Reply,
      // odgovor ide korisniku koji je popunio formu.
      replyTo: email,

      subject: `Kontakt forma: ${predmet}`,

      text: `
Nova poruka sa kontakt forme.

Ime: ${ime}
Email: ${email}
Predmet: ${predmet}

Poruka:
${poruka}
      `.trim(),

      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Nova poruka sa kontakt forme</h2>

          <p>
            <strong>Ime:</strong><br>
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
      message: "Poruka je uspešno poslata.",
    });
  } catch (error) {
    console.error("KONTAKT EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Došlo je do greške prilikom slanja poruke.",
      },
      { status: 500 }
    );
  }
}
