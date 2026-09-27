import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DRUPAL_BASE_URL =
  process.env.NEXT_PUBLIC_DRUPAL_BASE_URL || "http://localhost:8888";

type TransactionType = "uplata" | "isplata";

type Operation = "balance" | "sum" | "count" | "list";

type Transaction = {
  id: string;
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  searchText: string;
};

type Intent = {
  type: "transaction";
  operation: Operation;
  transactionType?: TransactionType | null;
  searchTerms?: string[];
  dateFrom?: string | null;
  dateTo?: string | null;
};

const STOP_WORDS = new Set([
  "koliko",
  "koliki",
  "kolika",
  "koliki",
  "ukupno",
  "iznos",
  "iznose",
  "novca",
  "novac",
  "imamo",
  "imam",
  "imati",
  "trenutno",
  "sada",
  "sad",
  "racunu",
  "racun",
  "stanje",
  "saldo",

  "smo",
  "smo",
  "sta",
  "šta",
  "koje",
  "koji",
  "koja",
  "prikazi",
  "prikaži",
  "pokazi",
  "pokaži",
  "daj",
  "dajte",
  "reci",
  "navedi",
  "nadji",
  "nađi",
  "pronadji",
  "pronađi",

  "za",
  "od",
  "do",
  "u",
  "na",
  "sa",
  "kod",
  "preko",
  "prema",
  "iz",
  "i",
  "ili",
  "mi",
  "nama",
  "nam",
  "smo",
  "sam",
  "je",
  "su",
  "bio",
  "bilo",
  "bila",
  "bili",

  "uplata",
  "uplate",
  "uplatu",
  "uplatio",
  "uplatila",
  "uplatili",
  "uplaćeno",
  "uplaceno",
  "prihod",
  "prihodi",
  "prihoda",
  "priliv",
  "prilivi",
  "primio",
  "primila",
  "primili",
  "dobili",
  "dobio",
  "dobila",

  "isplata",
  "isplate",
  "isplatu",
  "isplatio",
  "isplatila",
  "isplatili",
  "placanje",
  "plaćanje",
  "placanja",
  "plaćanja",
  "platio",
  "platila",
  "platili",
  "dao",
  "dala",
  "dali",
  "rashod",
  "rashodi",
  "trosak",
  "trošak",
  "troskovi",
  "troškovi",
  "potrosili",
  "potrošili",

  "transakcija",
  "transakcije",
  "transakciju",
  "transakcija",

  "januar",
  "januara",
  "februar",
  "februara",
  "mart",
  "marta",
  "april",
  "aprila",
  "maj",
  "maja",
  "jun",
  "juna",
  "jul",
  "jula",
  "avgust",
  "avgusta",
  "septembar",
  "septembra",
  "oktobar",
  "oktobra",
  "novembar",
  "novembra",
  "decembar",
  "decembra",
]);

const MONTHS: Record<string, number> = {
  januar: 0,
  januara: 0,

  februar: 1,
  februara: 1,

  mart: 2,
  marta: 2,

  april: 3,
  aprila: 3,

  maj: 4,
  maja: 4,

  jun: 5,
  juna: 5,

  jul: 6,
  jula: 6,

  avgust: 7,
  avgusta: 7,

  septembar: 8,
  septembra: 8,

  oktobar: 9,
  oktobra: 9,

  novembar: 10,
  novembra: 10,

  decembar: 11,
  decembra: 11,
};

function normalizeText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseAmount(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(",", ".");

  const amount = Number(text);

  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("sr-RS", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " RSD";
}

function formatDate(date: string): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function getTransactionDescription(attributes: any): string {
  const body = attributes?.body;

  if (typeof body === "string") {
    return body;
  }

  if (body && typeof body === "object") {
    if (typeof body.value === "string") {
      return body.value;
    }

    if (typeof body.processed === "string") {
      return body.processed.replace(/<[^>]*>/g, " ");
    }

    if (typeof body.summary === "string") {
      return body.summary;
    }
  }

  return "";
}

function getSearchText(attributes: any): string {
  const values: string[] = [];

  // TITLE JE NAMERNO UKLJUČEN
  if (typeof attributes?.title === "string") {
    values.push(attributes.title);
  }

  const ignoredKeys = new Set([
    "created",
    "changed",
    "field_iznos",
    "field_tip",
    "drupal_internal__nid",
    "uuid",
    "title",
  ]);

  function collect(value: any, key = "") {
    if (value === null || value === undefined) {
      return;
    }

    if (ignoredKeys.has(key)) {
      return;
    }

    if (typeof value === "string") {
      const clean = value.replace(/<[^>]*>/g, " ").trim();

      if (clean) {
        values.push(clean);
      }

      return;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      values.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        collect(item, key);
      }

      return;
    }

    if (typeof value === "object") {
      for (const [childKey, childValue] of Object.entries(value)) {
        collect(childValue, childKey);
      }
    }
  }

  collect(attributes);

  return normalizeText(values.join(" "));
}

function mapDrupalTransaction(item: any): Transaction | null {
  const attributes = item?.attributes ?? {};

  const id = String(item?.id ?? "");

  if (!id) {
    return null;
  }

  const title =
    typeof attributes.title === "string" ? attributes.title.trim() : "";

  const description = getTransactionDescription(attributes);

  const rawType =
    attributes?.field_tip?.value ??
    attributes?.field_tip ??
    "";

  const typeText = normalizeText(rawType);

  let type: TransactionType;

  if (typeText === "uplata") {
    type = "uplata";
  } else if (typeText === "isplata") {
    type = "isplata";
  } else {
    return null;
  }

  const amount = parseAmount(
    attributes?.field_iznos?.value ??
      attributes?.field_iznos ??
      0
  );

  const date =
    attributes?.created ??
    item?.attributes?.created ??
    "";

  return {
    id,
    title,
    description,
    amount,
    type,
    date,
    searchText: getSearchText(attributes),
  };
}

function dedupeTransactions(
  transactions: Transaction[]
): Transaction[] {
  const map = new Map<string, Transaction>();

  for (const transaction of transactions) {
    if (!map.has(transaction.id)) {
      map.set(transaction.id, transaction);
    }
  }

  return Array.from(map.values());
}

function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function wordMatches(
  searchWord: string,
  transactionText: string
): boolean {
  const word = normalizeText(searchWord);

  if (!word) {
    return true;
  }

  const text = normalizeText(transactionText);

  if (!text) {
    return false;
  }

  if (text.includes(word)) {
    return true;
  }

  const words = text.split(/\s+/).filter(Boolean);

  for (const candidate of words) {
    if (candidate.includes(word) || word.includes(candidate)) {
      return true;
    }

    if (
      word.length >= 5 &&
      candidate.length >= 5 &&
      levenshtein(word, candidate) <= 2
    ) {
      return true;
    }
  }

  return false;
}

function transactionMatches(
  transaction: Transaction,
  searchTerms: string[]
): boolean {
  if (!searchTerms.length) {
    return true;
  }

  return searchTerms.every((term) =>
    wordMatches(term, transaction.searchText)
  );
}

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function extractLocalDateRange(question: string): {
  dateFrom: string | null;
  dateTo: string | null;
} {
  const q = normalizeText(question);

  const yearMatch = q.match(/\b(20\d{2})\b/);
  const year = yearMatch
    ? Number(yearMatch[1])
    : new Date().getFullYear();

  for (const [monthName, monthIndex] of Object.entries(MONTHS)) {
    if (q.includes(monthName)) {
      const from = new Date(year, monthIndex, 1);
      const to = new Date(year, monthIndex + 1, 0);

      return {
        dateFrom: startOfDay(from).toISOString(),
        dateTo: endOfDay(to).toISOString(),
      };
    }
  }

  const exactDate = q.match(
    /\b(\d{1,2})[.\/-](\d{1,2})(?:[.\/-](20\d{2}))?\b/
  );

  if (exactDate) {
    const day = Number(exactDate[1]);
    const month = Number(exactDate[2]) - 1;
    const exactYear = exactDate[3]
      ? Number(exactDate[3])
      : year;

    const date = new Date(exactYear, month, day);

    return {
      dateFrom: startOfDay(date).toISOString(),
      dateTo: endOfDay(date).toISOString(),
    };
  }

  return {
    dateFrom: null,
    dateTo: null,
  };
}

function detectTransactionTypeLocal(
  question: string
): TransactionType | null {
  const q = normalizeText(question);

  // ISPLATA / RASHOD
  if (
    /\b(isplat\w*|platil\w*|platio\w*|platila\w*|platili\w*|dao\w*|dala\w*|dali|rashod\w*|tros\w*|placanj\w*|potrosil\w*)\b/.test(
      q
    )
  ) {
    return "isplata";
  }

  // UPLATA / PRIHOD
  if (
    /\b(uplat\w*|uplati\w*|prihod\w*|priliv\w*|primil\w*|dobi\w*)\b/.test(
      q
    )
  ) {
    return "uplata";
  }

  return null;
}

function detectOperationLocal(
  question: string
): Operation | null {
  const q = normalizeText(question);

  // STANJE
  if (
    /\b(stanje|saldo|racunu|racun)\b/.test(q) &&
    !/\b(transakcij\w*)\b/.test(q)
  ) {
    return "balance";
  }

  if (
    /\b(koliko)\s+(ima|imamo|novca|sredstava)\b/.test(q)
  ) {
    return "balance";
  }

  if (
    /\b(koliko)\s+(transakcij\w*)\b/.test(q)
  ) {
    return "count";
  }

  if (
    /\b(prikazi|pokazi|navedi|koje|sta|nadji|pronadji)\b/.test(
      q
    )
  ) {
    return "list";
  }

  if (
    /\b(koliko|koliki|kolika|ukupno|iznos)\b/.test(q)
  ) {
    return "sum";
  }

  return null;
}

function extractLocalSearchTerms(
  question: string
): string[] {
  const normalized = normalizeText(question);

  const tokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const terms: string[] = [];

  for (const token of tokens) {
    if (STOP_WORDS.has(token)) {
      continue;
    }

    if (/^\d+$/.test(token)) {
      continue;
    }

    if (/^\d+[.,]\d+$/.test(token)) {
      continue;
    }

    if (token.length < 3) {
      continue;
    }

    terms.push(token);
  }

  return Array.from(new Set(terms));
}

function detectLocalIntent(
  question: string
): Intent | null {
  const transactionType =
    detectTransactionTypeLocal(question);

  const operation = detectOperationLocal(question);

  const { dateFrom, dateTo } =
    extractLocalDateRange(question);

  const searchTerms =
    extractLocalSearchTerms(question);

  // Jasno pitanje o stanju računa
  if (
    operation === "balance" &&
    !transactionType &&
    searchTerms.length === 0
  ) {
    return {
      type: "transaction",
      operation: "balance",
      transactionType: null,
      searchTerms: [],
      dateFrom,
      dateTo,
    };
  }

  // Ako imamo tip transakcije, možemo lokalno da obradimo pitanje
  if (transactionType) {
    return {
      type: "transaction",
      operation: operation ?? "sum",
      transactionType,
      searchTerms,
      dateFrom,
      dateTo,
    };
  }

  // "koliko trenutno imamo na računu"
  if (
    operation === "balance" ||
    /\bkoliko imamo\b/.test(
      normalizeText(question)
    )
  ) {
    return {
      type: "transaction",
      operation: "balance",
      transactionType: null,
      searchTerms: [],
      dateFrom: null,
      dateTo: null,
    };
  }

  return null;
}

function filterTransactions(
  transactions: Transaction[],
  intent: Intent
): Transaction[] {
  return transactions.filter((transaction) => {
    if (
      intent.transactionType &&
      transaction.type !== intent.transactionType
    ) {
      return false;
    }

    if (intent.searchTerms?.length) {
      if (
        !transactionMatches(
          transaction,
          intent.searchTerms
        )
      ) {
        return false;
      }
    }

    if (intent.dateFrom) {
      const transactionDate =
        new Date(transaction.date).getTime();

      const fromDate =
        new Date(intent.dateFrom).getTime();

      if (
        Number.isFinite(fromDate) &&
        transactionDate < fromDate
      ) {
        return false;
      }
    }

    if (intent.dateTo) {
      const transactionDate =
        new Date(transaction.date).getTime();

      const toDate =
        new Date(intent.dateTo).getTime();

      if (
        Number.isFinite(toDate) &&
        transactionDate > toDate
      ) {
        return false;
      }
    }

    return true;
  });
}

function calculateBalance(
  transactions: Transaction[]
): number {
  return transactions.reduce(
    (balance, transaction) => {
      if (transaction.type === "uplata") {
        return balance + transaction.amount;
      }

      if (transaction.type === "isplata") {
        return balance - transaction.amount;
      }

      return balance;
    },
    0
  );
}

function executeIntent(
  transactions: Transaction[],
  intent: Intent
): string {
  if (intent.operation === "balance") {
    const filtered =
      intent.dateFrom || intent.dateTo
        ? filterTransactions(transactions, intent)
        : transactions;

    const balance = calculateBalance(filtered);

    if (intent.dateFrom || intent.dateTo) {
      return `Stanje za izabrani period je ${formatMoney(
        balance
      )}.`;
    }

    return `Trenutno stanje na računu je ${formatMoney(
      balance
    )}.`;
  }

  const filtered = filterTransactions(
    transactions,
    intent
  );

  if (!filtered.length) {
    const typeText =
      intent.transactionType === "uplata"
        ? "uplata"
        : intent.transactionType === "isplata"
          ? "isplata"
          : "transakcija";

    const searchText =
      intent.searchTerms?.join(" ") || "";

    if (searchText) {
      return `Nisam pronašao ${typeText} koje odgovaraju pretrazi „${searchText}“.`;
    }

    return `Nisam pronašao odgovarajuće ${typeText}.`;
  }

  if (intent.operation === "count") {
    return `Pronašao sam ${filtered.length} ${
      filtered.length === 1
        ? "transakciju"
        : "transakcija"
    }.`;
  }

  if (intent.operation === "list") {
    const lines = filtered
      .slice(0, 20)
      .map((transaction) => {
        const name =
          transaction.title ||
          transaction.description ||
          "Bez opisa";

        const type =
          transaction.type === "uplata"
            ? "Uplata"
            : "Isplata";

        return `• ${formatDate(
          transaction.date
        )} — ${type}: ${name} — ${formatMoney(
          transaction.amount
        )}`;
      });

    let result =
      `Pronašao sam ${filtered.length} ${
        filtered.length === 1
          ? "transakciju"
          : "transakcija"
      }:\n\n${lines.join("\n")}`;

    if (filtered.length > 20) {
      result += `\n\nPrikazano je prvih 20 transakcija.`;
    }

    return result;
  }

  const total = filtered.reduce(
    (sum, transaction) =>
      sum + transaction.amount,
    0
  );

  const typeText =
    intent.transactionType === "uplata"
      ? "uplata"
      : intent.transactionType === "isplata"
        ? "isplata"
        : "transakcija";

  return `Ukupan iznos ${typeText} je ${formatMoney(
    total
  )} (${filtered.length} ${
    filtered.length === 1
      ? "transakcija"
      : "transakcija"
  }).`;
}

async function loadTransactions(): Promise<Transaction[]> {
  const url =
    `${DRUPAL_BASE_URL}/jsonapi/node/transakcija` +
    `?sort=-created&page[limit]=1000`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.api+json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Drupal transakcije: HTTP ${response.status}`
    );
  }

  const json = await response.json();

  const data = Array.isArray(json?.data)
    ? json.data
    : [];

  const transactions = data
    .map(mapDrupalTransaction)
    .filter(
      (
        transaction: Transaction | null
      ): transaction is Transaction =>
        transaction !== null
    );

  return dedupeTransactions(transactions);
}

async function askGroqForIntent(
  question: string
): Promise<Intent> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY nije podešen."
    );
  }

  const completion =
    await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      temperature: 0,
      max_tokens: 300,

      response_format: {
        type: "json_schema",
        json_schema: {
          name: "transaction_intent",
          strict: true,
          schema: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["transaction"],
              },

              operation: {
                type: "string",
                enum: [
                  "balance",
                  "sum",
                  "count",
                  "list",
                ],
              },

              transactionType: {
                anyOf: [
                  {
                    type: "string",
                    enum: [
                      "uplata",
                      "isplata",
                    ],
                  },
                  {
                    type: "null",
                  },
                ],
              },

              searchTerms: {
                type: "array",
                items: {
                  type: "string",
                },
              },

              dateFrom: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "null",
                  },
                ],
              },

              dateTo: {
                anyOf: [
                  {
                    type: "string",
                  },
                  {
                    type: "null",
                  },
                ],
              },
            },

            required: [
              "type",
              "operation",
              "transactionType",
              "searchTerms",
              "dateFrom",
              "dateTo",
            ],

            additionalProperties: false,
          },
        },
      },

      messages: [
        {
          role: "system",
          content: `
Ti si parser pitanja za finansijske transakcije stambene zajednice.

NE odgovaraj korisniku.
Tvoj jedini zadatak je da pitanje pretvoriš u JSON intent.

Pravila:

"uplata", "uplate", "uplatio", "uplatili",
"prihod", "priliv", "primili", "dobili"
=> transactionType = "uplata"

"isplata", "isplate", "isplatio", "platili",
"platio", "platila", "rashod", "trošak",
"potrošili", "plaćanje", "dali"
=> transactionType = "isplata"

"koliko", "koliki iznos", "ukupno"
=> operation = "sum"

"koliko transakcija"
=> operation = "count"

"prikaži", "pokaži", "navedi", "koje transakcije",
"šta smo platili"
=> operation = "list"

"koliko imamo", "stanje", "saldo", "koliko je na računu"
=> operation = "balance"

Sve konkretne osobe, firme, radove, stvari i opise
koje korisnik traži stavi u searchTerms.

Primeri:

"koliko smo platili Mirjani"
=> {
  "type":"transaction",
  "operation":"sum",
  "transactionType":"isplata",
  "searchTerms":["mirjani"]
}

"isplate za Mirjanu"
=> {
  "type":"transaction",
  "operation":"sum",
  "transactionType":"isplata",
  "searchTerms":["mirjanu"]
}

"šta smo platili za struju"
=> {
  "type":"transaction",
  "operation":"list",
  "transactionType":"isplata",
  "searchTerms":["struju"]
}

"koliko je Petrović uplatio"
=> {
  "type":"transaction",
  "operation":"sum",
  "transactionType":"uplata",
  "searchTerms":["petrovic"]
}

"koliko imamo na računu"
=> {
  "type":"transaction",
  "operation":"balance",
  "transactionType":null,
  "searchTerms":[],
  "dateFrom":null,
  "dateTo":null
}

Ne izmišljaj searchTerms.
Ne računaj iznose.
Ne vraćaj tekst.
`,
        },

        {
          role: "user",
          content: question,
        },
      ],
    });

  const content =
    completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(
      "Groq nije vratio intent."
    );
  }

  const parsed = JSON.parse(content);

  return {
    type: "transaction",
    operation: parsed.operation,
    transactionType:
      parsed.transactionType ?? null,
    searchTerms: Array.isArray(
      parsed.searchTerms
    )
      ? parsed.searchTerms
      : [],
    dateFrom:
      parsed.dateFrom ?? null,
    dateTo:
      parsed.dateTo ?? null,
  };
}

function isRateLimitError(error: any): boolean {
  const status =
    error?.status ??
    error?.response?.status;

  if (status === 429) {
    return true;
  }

  const message = String(
    error?.message ?? ""
  ).toLowerCase();

  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

function localFallback(
  question: string,
  transactions: Transaction[]
): string {
  const localIntent =
    detectLocalIntent(question);

  if (localIntent) {
    return executeIntent(
      transactions,
      localIntent
    );
  }

  return (
    "Groq AI je trenutno dostigao limit. " +
    "Pokušajte ponovo kasnije."
  );
}

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const question = String(
      body?.question ?? ""
    ).trim();

    if (!question) {
      return NextResponse.json(
        {
          answer:
            "Unesite pitanje za AI pomoćnika.",
        },
        { status: 400 }
      );
    }

    console.log(
      "AI pitanje:",
      question
    );

    const transactions =
      await loadTransactions();

    console.log(
      `AI: učitano ${transactions.length} transakcija.`
    );

    /*
     * 1. PRVO LOKALNI PARSER
     *
     * Ako je pitanje jasno finansijsko,
     * nema nikakvog Groq poziva.
     */
    const localIntent =
      detectLocalIntent(question);

    if (localIntent) {
      console.log(
        "AI: lokalni parser",
        JSON.stringify(localIntent)
      );

      const answer =
        executeIntent(
          transactions,
          localIntent
        );

      return NextResponse.json({
        answer,
        source: "local",
      });
    }

    /*
     * 2. GROQ ZA SLOŽENIJA PITANJA
     *
     * Groq dobija samo pitanje,
     * nikada celu bazu transakcija.
     */
    try {
      const intent =
        await askGroqForIntent(
          question
        );

      console.log(
        "AI: Groq intent",
        JSON.stringify(intent)
      );

      const answer =
        executeIntent(
          transactions,
          intent
        );

      return NextResponse.json({
        answer,
        source: "groq",
      });
    } catch (error: any) {
      console.error(
        "AI Groq greška:",
        error
      );

      /*
       * 3. AKO GROQ VRATI 429,
       * ponovo pokušavamo lokalno.
       */
      if (isRateLimitError(error)) {
        const answer =
          localFallback(
            question,
            transactions
          );

        return NextResponse.json({
          answer,
          source: "local-fallback",
          rateLimited: true,
        });
      }

      return NextResponse.json(
        {
          answer:
            "AI pomoćnik trenutno nije uspeo da pripremi odgovor. Pokušajte ponovo.",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(
      "AI route greška:",
      error
    );

    return NextResponse.json(
      {
        answer:
          "Došlo je do greške prilikom obrade pitanja.",
      },
      { status: 500 }
    );
  }
}
