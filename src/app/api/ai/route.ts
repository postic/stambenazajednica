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
     * --------------------------------------------------
     * UČITAVANJE SVIH TRANSAKCIJA
     * --------------------------------------------------
     */

    async function fetchAllTransakcije() {
      const firstPage = await fetchApi(
        "/api/transakcije"
      );

      if (!firstPage) {
        return null;
      }

      /*
       * Ako API direktno vraća niz.
       */
      if (Array.isArray(firstPage)) {
        return firstPage;
      }

      /*
       * Ako nema data niza.
       */
      if (!Array.isArray(firstPage.data)) {
        return firstPage;
      }

      /*
       * Prva stranica.
       */
      const sveTransakcije = [
        ...firstPage.data,
      ];

      /*
       * Broj ukupnih stranica.
       */
      const totalPages =
        typeof firstPage.totalPages === "number"
          ? firstPage.totalPages
          : 1;

      /*
       * Učitavamo sve preostale stranice.
       */
      if (totalPages > 1) {
        const remainingPages = await Promise.all(
          Array.from(
            {
              length: totalPages - 1,
            },
            (_, index) =>
              fetchApi(
                `/api/transakcije?page=${index + 2}`
              )
          )
        );

        for (const page of remainingPages) {
          if (
            page &&
            Array.isArray(page.data)
          ) {
            sveTransakcije.push(...page.data);
          }
        }
      }

      /*
       * ------------------------------------------------
       * DEDUPLIKACIJA
       * ------------------------------------------------
       *
       * Svaka transakcija ima jedinstveni ID.
       * Isti ID može postojati samo jednom.
       */
      const jedinstveneTransakcije =
        Array.from(
          new Map(
            sveTransakcije.map((transakcija) => [
              transakcija.id,
              transakcija,
            ])
          ).values()
        );

      console.log(
        `AI: učitano ${sveTransakcije.length} zapisa.`
      );

      console.log(
        `AI: ${jedinstveneTransakcije.length} jedinstvenih transakcija.`
      );

      return jedinstveneTransakcije;
    }

    /*
     * --------------------------------------------------
     * UČITAVANJE TRANSAKCIJA I PROSTORA
     * --------------------------------------------------
     */

    const [
      transakcije,
      prostoriData,
    ] = await Promise.all([
      fetchAllTransakcije(),
      fetchApi("/api/prostori"),
    ]);

    /*
     * Finansijski podaci su obavezni.
     */
    if (!transakcije) {
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
     * Podaci o prostorima.
     */
    let prostori = prostoriData;

    if (Array.isArray(prostoriData)) {
      prostori = prostoriData;
    } else if (
      prostoriData &&
      Array.isArray(prostoriData.prostori)
    ) {
      prostori = prostoriData.prostori;
    }

    /*
     * --------------------------------------------------
     * NORMALIZACIJA TEKSTA
     * --------------------------------------------------
     *
     * Omogućava poređenje:
     *
     * Mirjana
     * Mirjanu
     * MIRJANA
     * Mirjana Poštić
     *
     * bez obzira na velika/mala slova i dijakritiku.
     */
    function normalizeText(value: string) {
      return value
        .toLocaleLowerCase("sr-Latn")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    /*
     * --------------------------------------------------
     * PREPOZNAVANJE PITANJA ZA SVE TRANSAKCIJE
     * --------------------------------------------------
     */

    const normalizedQuestion =
      normalizeText(question);

    const traziSveTransakcije =
      normalizedQuestion.includes(
        "sve transakcije"
      ) ||
      normalizedQuestion.includes(
        "svih transakcija"
      ) ||
      normalizedQuestion.includes(
        "sve uplate"
      ) ||
      normalizedQuestion.includes(
        "sve isplate"
      );

    /*
     * --------------------------------------------------
     * PRONALAŽENJE KRITERIJUMA
     * --------------------------------------------------
     *
     * Primer:
     *
     * "Prikaži mi sve transakcije za Mirjanu"
     *
     * izdvaja:
     *
     * "mirjanu"
     */
    let searchTerm = "";

    const zaMatch =
      normalizedQuestion.match(
        /transakcije\s+za\s+(.+)$/
      );

    if (zaMatch?.[1]) {
      searchTerm = zaMatch[1]
        .replace(/[?.!,]+$/g, "")
        .trim();
    }

    /*
     * --------------------------------------------------
     * FILTRIRANE TRANSAKCIJE
     * --------------------------------------------------
     */

    let transakcijeZaAI = transakcije;

    if (
      traziSveTransakcije &&
      searchTerm
    ) {
      const searchWords =
        searchTerm.split(/\s+/).filter(
          (word: string) =>
            word.length >= 3
        );

      const filtrirane =
        transakcije.filter(
          (transakcija: any) => {
            const title =
              typeof transakcija.title ===
              "string"
                ? normalizeText(
                    transakcija.title
                  )
                : "";

            const body =
              typeof transakcija.body ===
              "string"
                ? normalizeText(
                    transakcija.body
                  )
                : "";

            const tekst =
              `${title} ${body}`;

            /*
             * Direktno podudaranje.
             */
            if (
              searchWords.some(
                (word: string) =>
                  tekst.includes(word)
              )
            ) {
              return true;
            }

            /*
             * Podudaranje po početku reči.
             *
             * Omogućava:
             *
             * Mirjanu → Mirjana
             * Marku → Marko
             * itd.
             */
            const tekstReci =
              tekst.split(/\s+/);

            return searchWords.some(
              (word: string) => {
                const stem =
                  word.substring(
                    0,
                    Math.min(
                      5,
                      word.length
                    )
                  );

                return tekstReci.some(
                  (tekstRec: string) =>
                    tekstRec.startsWith(
                      stem
                    )
                );
              }
            );
          }
        );

      /*
       * Ponovo deduplikujemo rezultat.
       */
      transakcijeZaAI =
        Array.from(
          new Map(
            filtrirane.map(
              (transakcija: any) => [
                transakcija.id,
                transakcija,
              ]
            )
          ).values()
        );

      console.log(
        `AI: pretraga "${searchTerm}" pronašla ${transakcijeZaAI.length} transakcija.`
      );
    }

    /*
     * --------------------------------------------------
     * PODACI ZA AI
     * --------------------------------------------------
     */

    const podaciZgrade = {
      transakcije: transakcijeZaAI,
      prostori,
    };

    const kontekst = JSON.stringify(
      podaciZgrade
    );

    /*
     * --------------------------------------------------
     * GROQ
     * --------------------------------------------------
     */

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.1,

        max_completion_tokens: 2048,

        reasoning_effort: "low",

        messages: [
          {
            role: "system",
            content: `
Ti si AI pomoćnik aplikacije Komšija.

Odgovaraj na srpskom jeziku, kratko, jasno i prirodno.

Koristi isključivo podatke koji su ti prosleđeni.
Ne izmišljaj podatke.

Ako potreban podatak nije dostupan, jasno reci
da taj podatak trenutno nemaš.

Novčane iznose prikazuj u RSD.

Kada je potrebno računanje, izračunaj rezultat
na osnovu dostupnih podataka.

FINANSIJE:

Ako korisnik pita koliko novca trenutno ima
zgrada, koristi podatke o transakcijama.

Ako korisnik pita za prihode, rashode ili
transakcije, koristi dostavljene transakcije.

Ako korisnik traži ukupan iznos za određeni
period, izračunaj ga na osnovu dostavljenih
transakcija.

Ako korisnik traži najveći ili najmanji rashod,
pretraži sve dostavljene transakcije.

Ako korisnik traži transakcije za određeni
mesec, godinu, tip, naziv ili opis, koristi
samo transakcije koje su ti prosleđene.

VAŽNO:

Ako korisnik traži "sve transakcije", prikaži
sve odgovarajuće transakcije koje su ti
prosleđene.

Ne izmišljaj dodatne transakcije.

Ne prikazuj istu transakciju više puta.

Svaka transakcija ima jedinstveni ID.

Jedan ID sme biti prikazan samo jednom.

Ako je lista transakcija već filtrirana,
ne pokušavaj da dodaješ druge transakcije.

Za svaku transakciju prikaži:
- datum
- naziv
- tip transakcije
- iznos
- opis, ako postoji

PROSTORI:

Ako korisnik pita koliko zgrada ima prostora,
stanova ili drugih prostora, koristi podatke
iz sekcije prostori.

Ako korisnik pita za konkretan broj stana ili
prostora, pronađi odgovarajući prostor u
dostavljenim podacima.

Ako korisnik pita ko je povezan sa određenim
prostorom, koristi samo podatke koji su
dostavljeni za taj prostor.

Ne pretpostavljaj da su svi prostori stanovi.

Koristi tip prostora ako je dostavljen.

Ako podatak o prostorima nije dostupan, reci
da trenutno nemaš podatke o prostorima.

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
     * Groq 413
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
     * Groq rate limit
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
