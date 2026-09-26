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
     * --------------------------------------------------
     * COOKIE PRIJAVLJENOG KORISNIKA
     * --------------------------------------------------
     */

    const cookie =
      request.headers.get("cookie") || "";

    /*
     * --------------------------------------------------
     * POMOĆNA FUNKCIJA ZA API
     * --------------------------------------------------
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
     * NORMALIZACIJA TEKSTA
     * --------------------------------------------------
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

    const normalizedQuestion =
      normalizeText(question);

    /*
     * --------------------------------------------------
     * PREPOZNAVANJE TIPA PITANJA
     * --------------------------------------------------
     */

    const financeKeywords = [
      "novca",
      "novac",
      "stanje",
      "racun",
      "racuna",
      "uplata",
      "uplate",
      "uplaceno",
      "isplata",
      "isplate",
      "rashod",
      "rashodi",
      "prihod",
      "prihodi",
      "transakcija",
      "transakcije",
      "transakciju",
      "iznos",
      "iznosa",
      "placeno",
      "placanja",
      "placanje",
      "dug",
      "dugovi",
      "saldo",
      "finansije",
      "finansijska",
      "novcano",
    ];

    const spaceKeywords = [
      "stan",
      "stana",
      "stanu",
      "stanovi",
      "stanova",
      "prostor",
      "prostora",
      "prostori",
      "prostoru",
      "sprat",
      "sprata",
      "spratu",
      "stanar",
      "stanari",
      "stanara",
      "stanaru",
      "vlasnik",
      "vlasnika",
      "vlasniku",
      "ko zivi",
      "ko živi",
      "koliko stanova",
      "koliko prostora",
      "broj stana",
    ];

    const hasFinanceQuestion =
      financeKeywords.some((keyword) =>
        normalizedQuestion.includes(keyword)
      );

    const hasSpaceQuestion =
      spaceKeywords.some((keyword) =>
        normalizedQuestion.includes(keyword)
      );

    /*
     * Ako pitanje eksplicitno traži transakcije
     * i određenu osobu/naziv, prvo pokušavamo
     * direktnu pretragu bez AI-ja.
     */

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
     * UČITAVANJE TRANSAKCIJA
     * --------------------------------------------------
     *
     * Sve transakcije učitavamo samo kada su
     * stvarno potrebne.
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

      const totalPages =
        typeof firstPage.totalPages === "number"
          ? firstPage.totalPages
          : 1;

      /*
       * Učitavanje ostalih stranica.
       */

      if (totalPages > 1) {
        const remainingPages =
          await Promise.all(
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
            sveTransakcije.push(
              ...page.data
            );
          }
        }
      }

      /*
       * Deduplikacija po ID-u.
       */

      const jedinstveneTransakcije =
        Array.from(
          new Map(
            sveTransakcije.map(
              (transakcija: any) => [
                transakcija.id,
                transakcija,
              ]
            )
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
     * DIREKTNA PRETRAGA TRANSAKCIJA
     * --------------------------------------------------
     *
     * Ovo ne koristi AI.
     */

    if (
      traziSveTransakcije &&
      searchTerm
    ) {
      const transakcije =
        await fetchAllTransakcije();

      if (!transakcije) {
        return NextResponse.json(
          {
            error:
              "Nije moguće učitati transakcije.",
          },
          {
            status: 500,
          }
        );
      }

      const searchWords =
        searchTerm
          .split(/\s+/)
          .filter(
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
             * Pokušaj prepoznavanja padeža.
             *
             * Mirjanu -> Mirjana
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
       * Deduplikacija.
       */

      const jedinstvene =
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
        `AI: pretraga "${searchTerm}" pronašla ${jedinstvene.length} transakcija.`
      );

      if (jedinstvene.length === 0) {
        return NextResponse.json({
          answer:
            `Nema pronađenih transakcija za "${searchTerm}".`,
        });
      }

      const lista =
        jedinstvene.map(
          (t: any) => {
            const datum =
              t.created
                ? new Intl.DateTimeFormat(
                    "sr-RS",
                    {
                      dateStyle: "short",
                    }
                  ).format(
                    new Date(t.created)
                  )
                : "";

            const iznos =
              new Intl.NumberFormat(
                "sr-RS",
                {
                  style: "currency",
                  currency: "RSD",
                  maximumFractionDigits: 2,
                }
              ).format(
                Number(t.amount) || 0
              );

            const tip =
              t.type === "uplata"
                ? "Uplata"
                : t.type === "isplata"
                  ? "Isplata"
                  : t.type || "";

            const opis =
              t.body
                ? ` — ${t.body}`
                : "";

            return `- ${datum} — ${t.title} — ${tip} — ${iznos}${opis}`;
          }
        );

      const brojTransakcija =
        jedinstvene.length;

      const odgovor = [
        `Pronađeno je ${brojTransakcija} ${
          brojTransakcija === 1
            ? "transakcija"
            : "transakcija"
        } za "${searchTerm}":`,
        "",
        ...lista,
      ].join("\n");

      return NextResponse.json({
        answer: odgovor,
      });
    }

    /*
     * --------------------------------------------------
     * UČITAVANJE PODATAKA ZA AI
     * --------------------------------------------------
     *
     * OVDE JE GLAVNA PROMENA.
     *
     * Ne učitavamo sve podatke za svako pitanje.
     */

    let transakcije: any = null;
    let prostori: any = null;

    /*
     * Ako je finansijsko pitanje,
     * učitavamo transakcije.
     */

    if (hasFinanceQuestion) {
      transakcije =
        await fetchAllTransakcije();

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
    }

    /*
     * Ako je pitanje o prostorima,
     * učitavamo samo prostore.
     */

    if (hasSpaceQuestion) {
      const prostoriData =
        await fetchApi("/api/prostori");

      if (
        Array.isArray(prostoriData)
      ) {
        prostori = prostoriData;
      } else if (
        prostoriData &&
        Array.isArray(
          prostoriData.prostori
        )
      ) {
        prostori =
          prostoriData.prostori;
      } else if (
        prostoriData &&
        Array.isArray(
          prostoriData.data
        )
      ) {
        prostori =
          prostoriData.data;
      } else {
        prostori = prostoriData;
      }
    }

    /*
     * Ako pitanje nije prepoznato kao finansijsko
     * ili pitanje o prostorima, ne šaljemo ogromne
     * podatke AI-ju.
     */

    const podaciZgrade: {
      transakcije?: any;
      prostori?: any;
    } = {};

    if (hasFinanceQuestion) {
      podaciZgrade.transakcije =
        transakcije;
    }

    if (hasSpaceQuestion) {
      podaciZgrade.prostori =
        prostori;
    }

    const kontekst =
      JSON.stringify(
        podaciZgrade
      );

    console.log(
      "AI pitanje:",
      question
    );

    console.log(
      "AI podaci:",
      {
        finansije: hasFinanceQuestion,
        prostori: hasSpaceQuestion,
        duzinaKonteksta:
          kontekst.length,
      }
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

        max_completion_tokens: 1024,

        reasoning_effort: "low",

        messages: [
          {
            role: "system",
            content: `
Ti si AI pomoćnik aplikacije Komšija.

Odgovaraj na srpskom jeziku,
kratko, jasno i prirodno.

Koristi isključivo podatke koji su
ti prosleđeni.

Ne izmišljaj podatke.

Ako potreban podatak nije dostupan,
jasno reci da taj podatak trenutno nemaš.

Novčane iznose prikazuj u RSD.

Kada je potrebno računanje,
izračunaj rezultat na osnovu dostupnih
podataka.

FINANSIJE:

Ako postoje podaci o transakcijama,
koristi ih za pitanja o novcu,
stanju računa, prihodima, rashodima
i transakcijama.

Ako korisnik traži ukupan iznos,
izračunaj ga na osnovu dostavljenih
transakcija.

Ako korisnik traži najveći ili najmanji
rashod, pretraži dostavljene transakcije.

Ne izmišljaj dodatne transakcije.

Ne prikazuj istu transakciju više puta.

PROSTORI:

Ako postoje podaci o prostorima,
koristi ih za pitanja o stanovima,
prostorima, spratovima i stanarima.

Ako korisnik pita koliko ima stanova
ili prostora, prebroj dostavljene podatke.

Ako korisnik pita za konkretan broj stana
ili prostora, pronađi odgovarajući prostor.

Ako korisnik pita ko je povezan sa određenim
prostorom, koristi samo podatke koji su
dostavljeni za taj prostor.

Ne pretpostavljaj da su svi prostori stanovi.

Koristi tip prostora ako je dostavljen.

Ako traženi podatak nije u dostavljenim
podacima, reci da ga trenutno nemaš.

Ne pominji Drupal, API, JSON, Groq
ili tehničku implementaciju.

PODACI:

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
    console.error(
      "AI greška:",
      error
    );

    /*
     * --------------------------------------------------
     * GROQ 413
     * --------------------------------------------------
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
     * --------------------------------------------------
     * GROQ 429
     * --------------------------------------------------
     */

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error:
            "AI pomoćnik je trenutno zauzet ili je dostignut limit tokena. Pokušajte ponovo kasnije.",
        },
        {
          status: 429,
        }
      );
    }

    /*
     * --------------------------------------------------
     * OSTALA GREŠKA
     * --------------------------------------------------
     */

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
