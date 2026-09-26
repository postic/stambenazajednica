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
     * Cookie prijavljenog korisnika.
     *
     * Prosleđujemo ga našim internim API endpointima
     * kako bi oni koristili postojeću autentifikaciju.
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
        console.error(`Greška prilikom učitavanja ${path}:`, error);

        return null;
      }
    }

    /*
     * Učitavamo podatke iz više delova aplikacije.
     */
    const [
      transakcijeData,
      prostoriData,
      obavestenjaData,
      sedniceData,
      anketeData,
    ] = await Promise.all([
      fetchApi("/api/transakcije"),
      fetchApi("/api/prostori"),
      fetchApi("/api/obavestenja"),
      fetchApi("/api/sednice"),
      fetchApi("/api/ankete"),
    ]);

    /*
     * Ako nema finansijskih podataka, vraćamo grešku.
     *
     * Ostali podaci mogu biti nedostupni, ali AI
     * i dalje može da odgovori na osnovu onoga
     * što je uspešno učitano.
     */
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
     * Objedinjujemo sve podatke koje AI sme da koristi.
     */
    const podaciZgrade = {
      transakcije: transakcijeData,
      //prostori: prostoriData,
      //obavestenja: obavestenjaData,
      //sednice: sedniceData,
      //ankete: anketeData,
    };

    const kontekst = JSON.stringify(
      podaciZgrade,
      null,
      2
    );

    /*
     * Poziv Groq AI servisa.
     */
    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        temperature: 0.2,

        max_completion_tokens: 1024,

        messages: [
          {
            role: "system",
            content: `
Ti si AI pomoćnik aplikacije Komšija.

Komšija je aplikacija za stambene zajednice.

Odgovaraj korisniku na srpskom jeziku, jasno,
kratko i prirodno.

Korisnik može da postavlja pitanja o svojoj
stambenoj zajednici.

Dostavljeni su ti podaci iz aplikacije Komšija.

PODACI ZGRADE:
${kontekst}

PRAVILA:

1. Koristi isključivo podatke koji su ti prosleđeni.

2. Nemoj izmišljati podatke.

3. Ako podatak potreban za odgovor nije dostupan,
   jasno reci da taj podatak nemaš.

4. Kada korisnik traži računanje, izračunaj rezultat
   na osnovu dostupnih podataka.

5. Sve novčane iznose prikazuj u RSD.

6. Odgovaraj na srpskom jeziku.

7. Budi kratak, konkretan i prirodan.

8. Nemoj pominjati Drupal, API, JSON, Groq,
   programiranje ili tehničku implementaciju.

9. Ako korisnik pita koliko novca trenutno ima
   zgrada, koristi trenutno stanje iz dostavljenih
   finansijskih podataka.

10. Ako korisnik pita za prihode ili rashode,
    koristi samo dostavljene transakcije.

11. Ako korisnik pita koliko postoji prostora,
    stanova ili drugih prostora, koristi podatke
    iz sekcije PROSTORI.

12. Ako korisnik pita o obaveštenjima, koristi
    podatke iz sekcije OBAVEŠTENJA.

13. Ako korisnik pita o sednicama, koristi
    podatke iz sekcije SEDNICE.

14. Ako korisnik pita o anketama, koristi
    podatke iz sekcije ANKETE.

15. Ako podatak nije dostavljen, nemoj pokušavati
    da ga pretpostaviš na osnovu drugih podataka.

16. Ako pitanje nije povezano sa stambenom zajednicom,
    možeš kratko odgovoriti, ali nemoj izmišljati
    informacije o konkretnoj zgradi.

17. Kada je potrebno napraviti matematički proračun,
    prikaži rezultat jasno.

18. Ako korisnik pita da li zgrada može da plati
    određeni iznos, izračunaj koliko bi ostalo nakon
    plaćanja i jasno reci da je to matematički
    proračun na osnovu trenutnog stanja.

Primer:

Pitanje:
"Imamo li dovoljno za račun od 80.000 dinara?"

Ako je trenutno stanje 206.464 RSD:

"Da. Nakon plaćanja od 80.000 RSD, na računu bi
ostalo 126.464 RSD."

Primer:

Pitanje:
"Koliko imamo stanova?"

Ako podaci pokazuju 24 prostora:

"Zgrada ima 24 prostora."

Ne prikazuj tehničke podatke korisniku.
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
