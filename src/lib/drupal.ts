// src/lib/drupal.ts

export interface DrupalOption {
  value: string;
  label: string;
}

export async function getFieldOptions(
  entityType: string,   // npr: "node"
  bundle: string,       // npr: "kvar"
  fieldName: string     // npr: "field_prioritet_kvara"
): Promise<DrupalOption[]> {
  const url = `${process.env.NEXT_PUBLIC_DRUPAL_BASE_URL}/jsonapi/field_config/${entityType}.${bundle}.${fieldName}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // cache 1h
  });

  if (!res.ok) {
    console.error("Field options fetch failed:", url);
    return [];
  }

  const data = await res.json();

  return (
    data?.data?.attributes?.settings?.allowed_values || []
  );
}
