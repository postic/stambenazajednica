import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL ||
  "http://localhost:8888";

const MODEL =
  process.env.GROQ_MODEL ||
  "llama-3.1-8b-instant";

type Transaction = {
  datum: string;
  tip: string;
  iznos: number;
};

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Provera API ključa
    // --------------------------------------------------

    if (!process.env.GROQ_API_KEY) {
      console.error(
        "AI GREŠKA: GROQ_API_KEY nije podešen."
      );

      return NextResponse.json(
        {
          error:
            "AI pomoćnik trenutno nije podešen. Proverite podešavanja aplikacije.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // 2. Čitanje pitanja
    // --------------------------------------------------

    const body = await request.json();

    const question =
      typeof body?.question === "string"
        ? body.question.trim()
        : "";

    if (!question) {
      return NextResponse.json(
        {
          error: "Unesite pitanje.",
        },
        { status: 400 }
      );
    }

    const safeQuestion = question.slice(0, 1000);

    console.log("AI: pitanje =", safeQuestion);
    console.log("AI: model =", MODEL);
    console.log("AI: Drupal URL =", DRUPAL_BASE_URL);

    // --------------------------------------------------
    // 3. Da li pitanje zahteva konkretne transakcije?
    // --------------------------------------------------

    const transactionKeywords = [
      "transakcij",
      "uplatu",
      "uplate",
      "uplata",
      "rashod",
      "rashode",
      "rashoda",
      "prihod",
      "prihode",
      "prihoda",
      "trošak",
      "troška",
      "troškove",
      "plaćanj",
      "plaćanje",
      "plaćanja",
      "isplat",
      "isplata",
      "isplate",
      "potroš",
      "potrošnja",
      "račun",
      "računa",
      "kupovin",
      "servis",
      "majstor",
      "poslednj",
      "najveć",
      "najmanj",
      "koliko puta",
      "kada je",
      "kog datuma",
    ];

    const normalizedQuestion =
      safeQuestion.toLowerCase();

    const needsTransactions =
      transactionKeywords.some((keyword) =>
        normalizedQuestion.includes(keyword)
      );

    console.log(
      "AI: potrebno slati transakcije =",
      needsTransactions
    );

    // --------------------------------------------------
    // 4. Učitavanje transakcija iz Drupala
    // --------------------------------------------------

    const transakcijeUrl =
      `${DRUPAL_BASE_URL}/jsonapi/node/transakcija` +
      "?sort=-created&page[limit]=1000";

    console.log("AI: učitavam transakcije...");

    let transakcijeResponse: Response;

    try {
      transakcijeResponse = await fetch(
        transakcijeUrl,
        {
          headers: {
            Accept: "application/vnd.api+json",
          },
          cache: "no-store",
        }
      );
    } catch (error) {
      console.error(
        "AI GREŠKA: Drupal fetch nije uspeo.",
        error
      );

      return NextResponse.json(
        {
          error:
            "Podaci o finansijama trenutno nisu dostupni. Pokušajte ponovo za nekoliko trenutaka.",
        },
        { status: 503 }
      );
    }

    if (!transakcijeResponse.ok) {
      const errorText =
        await transakcijeResponse.text();

      console.error(
        "AI GREŠKA: Drupal status:",
        transakcijeResponse.status
      );

      console.error(
        "AI GREŠKA: Drupal odgovor:",
        errorText
      );

      return NextResponse.json(
        {
          error:
            "Podaci o finansijama trenutno nisu dostupni. Pokušajte ponovo za nekoliko trenutaka.",
        },
        { status: 503 }
      );
    }

    const transakcijeData =
      await transakcijeResponse.json();

    const rawTransactions =
      Array.isArray(transakcijeData?.data)
        ? transakcijeData.data
        : [];

    console.log(
      `AI: učitano ${rawTransactions.length} transakcija.`
    );

    // --------------------------------------------------
    // 5. Pretvaranje Drupal podataka
    // --------------------------------------------------

    const transactions: Transaction[] =
      rawTransactions.map(
        (item: any): Transaction => {
          const attributes =
            item?.attributes || {};

          return {
            datum:
              String(
                attributes?.created ?? ""
              ),

            tip:
              String(
                attributes?.field_tip ?? ""
              ),

            iznos:
              Number(
                attributes?.field_iznos ?? 0
              ) || 0,
          };
        }
      );

    // --------------------------------------------------
    // 6. Uklanjanje duplikata
    // --------------------------------------------------

    const uniqueTransactions: Transaction[] =
      Array.from(
        new Map<string, Transaction>(
          transactions.map(
            (transaction: Transaction) => [
              `${transaction.datum}|${transaction.tip}|${transaction.iznos}`,
              transaction,
            ]
          )
        ).values()
      );

    console.log(
      `AI: ${uniqueTransactions.length} jedinstvenih transakcija.`
    );

    // --------------------------------------------------
    // 7. Računanje finansija
    // --------------------------------------------------

    let stanje = 0;
    let prihodi = 0;
    let rashodi = 0;

    for (const transaction of uniqueTransactions) {
      const tip = String(
        transaction.tip
      ).toLowerCase();

      const iznos =
        Number(transaction.iznos) || 0;

      if (
        tip.includes("uplata") ||
        tip.includes("prihod") ||
        tip.includes("priliv")
      ) {
        stanje += iznos;
        prihodi += iznos;
      } else {
        stanje -= iznos;
        rashodi += iznos;
      }
    }

    console.log(
      "AI: trenutno stanje =",
      stanje
    );

    console.log(
      "AI: prihodi =",
      prihodi
    );

    console.log(
      "AI: rashodi =",
      rashodi
    );

    // --------------------------------------------------
    // 8. Formatiranje transakcija
    // --------------------------------------------------

    const formattedTransactions =
      uniqueTransactions.map(
        (transaction: Transaction) => ({
          datum: transaction.datum
            ? String(
                transaction.datum
              ).slice(0, 10)
            : "",

          tip: transaction.tip,

          iznos: transaction.iznos,
        })
      );

    // --------------------------------------------------
    // 9. Ograničavanje transakcija koje šaljemo AI-ju
    // --------------------------------------------------

    const transactionsForAI =
      needsTransactions
        ? formattedTransactions.slice(0, 150)
        : [];

    console.log(
      `AI: transakcija poslato modelu = ${transactionsForAI.length}`
    );

    // --------------------------------------------------
    // 10. Finansijski kontekst
    // --------------------------------------------------

    const financialContext = {
      trenutno_stanje:
        Number(stanje.toFixed(2)),

      ukupni_prihodi:
        Number(prihodi.toFixed(2)),

      ukupni_rashodi:
        Number(rashodi.toFixed(2)),

      broj_transakcija:
        formattedTransactions.length,

      ...(needsTransactions
        ? {
            transakcije:
              transactionsForAI,
          }
        : {}),
    };

    // --------------------------------------------------
    // 11. Prompt
    // --------------------------------------------------

    const systemPrompt = `
Ti si AI pomoćnik aplikacije "Komšija" za stambenu zajednicu.

Odgovaraj na srpskom jeziku, latinicom.

Pomažeš korisniku da razume finansije njegove stambene zajednice.

PRAVILA:

- Koristi isključivo podatke iz finansijskog konteksta.
- Ne izmišljaj podatke.
- Ako podatak nije dostupan, reci da nemaš taj podatak.
- Ne nagađaj.
- Budi kratak i konkretan.
- Za iznose koristi RSD.
- Ako korisnik pita za trenutno stanje, koristi trenutno_stanje.
- Ako pita za prihode, koristi ukupne_prihode.
- Ako pita za rashode, koristi ukupne_rashode.
- Ako pita za broj transakcija, koristi broj_transakcija.
- Ako su transakcije dostupne u kontekstu, možeš ih koristiti za odgovor na konkretna pitanja.
- Ako transakcije nisu dostupne u kontekstu, nemoj izmišljati pojedinačne transakcije.
- Ako pitanje traži konkretnu transakciju koju ne možeš pronaći, reci da nemaš dovoljno podataka.
- Ako pita koliko trenutno ima novca na računu, odgovori direktno.
- Ne prikazuj interne tehničke podatke.
- Ne spominji Groq, API, Drupal, model ili tokene.
- Ako pitanje nije povezano sa finansijama zgrade, kratko reci da možeš pomoći oko finansija i transakcija zgrade.

FINANSIJSKI PODACI:

${JSON.stringify(financialContext)}
`.trim();

    console.log(
      "AI: veličina finansijskog konteksta =",
      systemPrompt.length,
      "karaktera"
    );

    console.log("AI: pozivam Groq...");

    // --------------------------------------------------
    // 12. Groq
    // --------------------------------------------------

    let completion;

    try {
      completion =
        await groq.chat.completions.create({
          model: MODEL,

          temperature: 0.1,

          max_tokens: 300,

          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: safeQuestion,
            },
          ],
        });
    } catch (error: any) {
      console.error(
        "AI GREŠKA: Groq zahtev nije uspeo."
      );

      console.error(
        "AI GREŠKA status:",
        error?.status
      );

      console.error(
        "AI GREŠKA statusCode:",
        error?.statusCode
      );

      console.error(
        "AI GREŠKA message:",
        error?.message
      );

      console.error(
        "AI GREŠKA name:",
        error?.name
      );

      console.error(
        "AI GREŠKA:",
        error
      );

      // --------------------------------------------------
      // 429 - rate limit
      // --------------------------------------------------

      if (
        error?.status === 429 ||
        error?.statusCode === 429 ||
        String(
          error?.message || ""
        ).includes("429")
      ) {
        const retryAfter =
          error?.headers?.get?.(
            "retry-after"
          );

        let retryMessage =
          "Pokušajte ponovo za nekoliko minuta.";

        if (retryAfter) {
          const seconds =
            Number(retryAfter);

          if (
            Number.isFinite(seconds) &&
            seconds > 0
          ) {
            const minutes =
              Math.ceil(seconds / 60);

            retryMessage =
              minutes === 1
                ? "Pokušajte ponovo za oko 1 minut."
                : `Pokušajte ponovo za oko ${minutes} minuta.`;
          }
        }

        return NextResponse.json(
          {
            error:
              `AI pomoćnik je trenutno ograničen zbog velikog broja zahteva. ${retryMessage}`,
          },
          {
            status: 429,
          }
        );
      }

      // --------------------------------------------------
      // 401 / 403 - API ključ
      // --------------------------------------------------

      if (
        error?.status === 401 ||
        error?.status === 403
      ) {
        return NextResponse.json(
          {
            error:
              "AI pomoćnik trenutno nije dostupan. Proverite podešavanje AI servisa.",
          },
          {
            status: 503,
          }
        );
      }

      // --------------------------------------------------
      // 404 - model
      // --------------------------------------------------

      if (error?.status === 404) {
        return NextResponse.json(
          {
            error:
              "AI pomoćnik trenutno nije dostupan. AI model nije pronađen.",
          },
          {
            status: 503,
          }
        );
      }

      // --------------------------------------------------
      // Ostale Groq greške
      // --------------------------------------------------

      return NextResponse.json(
        {
          error:
            "AI pomoćnik trenutno nije dostupan. Pokušajte ponovo za nekoliko trenutaka.",
        },
        {
          status: 503,
        }
      );
    }

    // --------------------------------------------------
    // 13. Čitanje odgovora
    // --------------------------------------------------

    const answer =
      completion?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      console.error(
        "AI GREŠKA: Groq je vratio prazan odgovor."
      );

      console.error(
        "AI completion:",
        completion
      );

      return NextResponse.json(
        {
          error:
            "AI pomoćnik trenutno nije uspeo da pripremi odgovor. Pokušajte ponovo.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "AI: odgovor =",
      answer
    );

    // --------------------------------------------------
    // 14. Uspešan odgovor
    // --------------------------------------------------

    return NextResponse.json({
      answer,
    });
  } catch (error: any) {
    // --------------------------------------------------
    // 15. Neočekivana greška
    // --------------------------------------------------

    console.error(
      "AI KRITIČNA GREŠKA:",
      error
    );

    console.error(
      "AI KRITIČNA GREŠKA message:",
      error?.message
    );

    console.error(
      "AI KRITIČNA GREŠKA stack:",
      error?.stack
    );

    return NextResponse.json(
      {
        error:
          "AI pomoćnik trenutno nije dostupan. Pokušajte ponovo za nekoliko trenutaka.",
      },
      {
        status: 500,
      }
    );
  }
}
