export async function getDoorCode() {
  const res = await fetch(`${process.env.DRUPAL_BASE_URL}/api/zgrada-config`, {
    next: { revalidate: 60 }, // osveži na minut
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.door_code;
}
