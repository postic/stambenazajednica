import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY nije podešen.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          error: "Pitanje je obavezno.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Preuzimamo cookie prijavljenog korisnika.
     * Na taj način /api/transakcije može da koristi
     * postojeću autentifikaciju Komšije.
     */
    const cookie = request.headers.get("cookie") || "";

    /*
     * Uzimamo podatke iz postojećeg endpointa Komšije.
     */
    const url = new URL("/api/transakcije", request.url);

    const transakcijeResponse = await fetch(url, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
      cache: "no-store",
    });


    if (!transakcijeResponse.ok) {
      console.error(
        "Greška /api/transakcije:",
        transakcijeResponse.status,
        transakcijeResponse.statusText
      );

      return NextResponse.json(
        {
          error:
            "Nije moguće učitati finansijske podatke zgrade.",
        },
        {
          status: 500,
        }
      );
    }

    const transakcijeData =
      await transakcijeResponse.json();

    /*
     * Podaci iz Komšije koje prosleđujemo AI-ju.
     */
    const finansijskiPodaci =
      JSON.stringify(transakcijeData);

    /*
     * Poziv Groq AI servisa.
     */
    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.2,

        max_completion_tokens: 500,

        messages: [
          {
            role: "system",
            content: `
Ti si AI pomoćnik aplikacije Komšija.

Komšija je aplikacija za stambene zajednice.

Odgovaraj korisniku na srpskom jeziku, jasno,
kratko i prirodno.

Korisnik može da postavlja pitanja o finansijama
njegove stambene zajednice.

Ispod se nalaze finansijski podaci koje je Komšija
dobio iz svog internog API-ja.

FINANSIJSKI PODACI:
${finansijskiPodaci}

PRAVILA:

1. Koristi samo podatke koji su ti prosleđeni.

2. Nemoj izmišljati stanje računa, transakcije,
   prihode ili rashode.

3. Ako podatak potreban za odgovor nije dostupan,
   reci da taj podatak nemaš.

4. Kada korisnik traži računanje, izračunaj rezultat
   na osnovu dostupnih podataka.

5. Sve novčane iznose prikazuj u RSD.

6. Odgovaraj na srpskom jeziku.

7. Budi kratak i konkretan.

8. Nemoj pominjati Drupal, API, JSON, Groq,
   programiranje ili tehničku implementaciju.

9. Ako korisnik pita koliko novca trenutno ima
   zgrada, pronađi trenutno stanje u dostavljenim
   podacima.

10. Ako korisnik pita da li zgrada može da plati
    određeni iznos, izračunaj koliko bi novca ostalo
    nakon plaćanja, ali jasno navedi da je to
    matematički proračun na osnovu trenutnog stanja.

Primer:

Pitanje:
"Imamo li dovoljno za račun od 80.000 dinara?"

Ako je stanje 206.464 RSD, odgovor može biti:

"Da. Nakon plaćanja od 80.000 RSD, na računu bi ostalo
126.464 RSD."
            `.trim(),
          },

          {
            role: "user",
            content: question,
          },
        ],
      });

    const answer =
      completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      return NextResponse.json(
        {
          error: "AI nije vratio odgovor.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      answer,
    });
  } catch (error) {
    console.error("AI greška:", error);

    return NextResponse.json(
      {
        error:
          "Došlo je do greške prilikom komunikacije sa AI servisom.",
      },
      {
        status: 500,
      }
    );
  }
}
