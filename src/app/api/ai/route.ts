import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
     * Cookie prijavljenog korisnika.
     */
    const cookie = request.headers.get("cookie") || "";

    /*
     * Pomoćna funkcija za učitavanje podataka
     * iz internog Komšija API-ja.
     */
    async function fetchApi(path: string) {
      const url = new URL(path, request.url);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Cookie: cookie,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          console.error(
            `Greška ${path}:`,
            response.status,
            response.statusText
          );

          return null;
        }

        return await response.json();
      } catch (error) {
        console.error(
          `Greška prilikom učitavanja ${path}:`,
          error
        );

        return null;
      }
    }

    /*
     * Trenutno učitavamo samo finansijske podatke.
     *
     * Ostale podatke ćemo dodavati kasnije samo kada
     * budu potrebni za određeno pitanje.
     */
    const transakcijeData = await fetchApi("/api/transakcije");

    if (!transakcijeData) {
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

    /*
     * Uzimamo samo poslednjih 100 transakcija.
     *
     * Cilj je da AI ne dobije nepotrebno veliki prompt.
     */
    let transakcije = transakcijeData;

    if (Array.isArray(transakcijeData)) {
      transakcije = transakcijeData.slice(0, 100);
    } else if (
      Array.isArray(transakcijeData.transakcije)
    ) {
      transakcije = {
        ...transakcijeData,
        transakcije: transakcijeData.transakcije.slice(
          0,
          100
        ),
      };
    }

    /*
     * Objedinjujemo podatke koje AI trenutno sme da koristi.
     */
    const podaciZgrade = {
      transakcije,
    };

    const kontekst = JSON.stringify(podaciZgrade);

    /*
     * Poziv Groq AI servisa.
     */
    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.2,

        max_completion_tokens: 1024,

        reasoning_effort: "low",

        messages: [
          {
            role: "system",
            content: `
Ti si AI pomoćnik aplikacije Komšija.

Odgovaraj na srpskom jeziku, kratko, jasno i prirodno.

Koristi isključivo podatke koji su ti prosleđeni.
Ne izmišljaj podatke.

Ako potreban podatak nije dostupan, reci da taj
podatak trenutno nemaš.

Novčane iznose prikazuj u RSD.

Kada je potrebno računanje, izračunaj rezultat
na osnovu dostupnih podataka.

Ako korisnik pita koliko novca trenutno ima zgrada,
koristi trenutno stanje iz finansijskih podataka.

Ako pita za prihode, rashode ili transakcije,
koristi samo dostavljene transakcije.

Ako pitanje nije povezano sa podacima koje imaš,
reci da taj podatak trenutno nemaš.

Ne pominji Drupal, API, JSON, Groq ili tehničku
implementaciju.

PODACI ZGRADE:
${kontekst}
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
  } catch (error: any) {
    console.error("AI greška:", error);

    /*
     * Groq 413 - zahtev je prevelik.
     */
    if (error?.status === 413) {
      return NextResponse.json(
        {
          error:
            "Podaci koji su poslati AI pomoćniku su preveliki. Pokušajte sa konkretnijim pitanjem.",
        },
        {
          status: 413,
        }
      );
    }

    /*
     * Groq rate limit.
     */
    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            "AI pomoćnik je trenutno zauzet. Pokušajte ponovo za nekoliko sekundi.",
        },
        {
          status: 429,
        }
      );
    }

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
