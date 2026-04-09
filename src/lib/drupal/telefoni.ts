// lib/drupal/telefoni.ts

export type Telefon = {
  id: string;
  title: string;
  phone: string;
  kategorija: string;
  pinned: boolean;
};

// 🔌 MAIN FETCH
export async function getTelefoni(): Promise<Telefon[]> {
  const baseUrl = process.env.NEXT_PUBLIC_DRUPAL_BASE_URL;

  if (!baseUrl) {
    console.error("❌ Nema NEXT_PUBLIC_DRUPAL_BASE_URL");
    return [];
  }

  try {
    const res = await fetch(
      `${baseUrl}/jsonapi/node/telefon?include=field_kategorija`,
      {
        headers: {
          "Content-Type": "application/vnd.api+json",
        },
        next: { revalidate: 60 }, // кеш 60 sekundi
      }
    );

    if (!res.ok) {
      console.error("❌ Drupal fetch failed:", res.status);
      return [];
    }

    const json = await res.json();

    return mapTelefoni(json);
  } catch (err) {
    console.error("❌ Greška:", err);
    return [];
  }
}

function mapTelefoni(json: any): Telefon[] {
  const included = json.included || [];

  return (json.data || []).map((item: any) => {
    // 📂 KATEGORIJA
    const kategorijaId =
      item.relationships?.field_kategorija?.data?.id;

    const kategorijaEntity = included.find(
      (inc: any) => inc.id === kategorijaId
    );

    const kategorija =
      kategorijaEntity?.attributes?.name || "Ostalo";

    // 📞 PHONE (različiti Drupal formati)
    let phone = "";

    if (typeof item.attributes.field_phone === "string") {
      phone = item.attributes.field_phone;
    } else if (item.attributes.field_phone?.value) {
      phone = item.attributes.field_phone.value;
    }

    // 📌 PINNED
    const pinned =
      item.attributes.field_pinned ?? false;

    return {
      id: item.id,
      title: item.attributes.title || "",
      phone,
      kategorija,
      pinned,
    };
  });
}
