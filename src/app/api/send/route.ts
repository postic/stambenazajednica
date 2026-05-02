import getAdmin from "@/lib/fcmAdmin";

let tokens: string[] = [];

export async function POST() {
  const admin = getAdmin();

  if (!tokens.length) {
    return Response.json({ error: "No tokens" }, { status: 400 });
  }

  const message = {
    notification: {
      title: "Nova poruka",
      body: "Test push notifikacija",
    },
    tokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  return Response.json(response);
}
