import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("access_token")?.value;

  if (!token) {
    return Response.json({ user: null });
  }

  // 1️⃣ Ko je user
  const userinfoRes = await fetch(
    `${process.env.DRUPAL_BASE_URL}/oauth/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!userinfoRes.ok) {
    return Response.json({ user: null });
  }

  const userinfo = await userinfoRes.json();
  const uid = userinfo.sub;

  // 2️⃣ Uzmi user preko JSON:API
  const userRes = await fetch(
    `${process.env.DRUPAL_BASE_URL}/jsonapi/user/user?filter[uid]=${uid}&include=user_picture`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!userRes.ok) {
    return Response.json({ user: null });
  }

  const userData = await userRes.json();
  const user = userData.data[0];

  // 3️⃣ Izvuci sliku iz include sekcije
  let pictureUrl = "/avatar-placeholder.png";

  if (userData.included) {
    const file = userData.included.find(
      (item: any) => item.type === "file--file"
    );

    if (file?.attributes?.uri?.url) {
      pictureUrl =
        process.env.DRUPAL_BASE_URL + file.attributes.uri.url;
    }
  }

  return Response.json({
    user: {
      uid: user.id,
      name: user.attributes.display_name,
      mail: user.attributes.mail,
      picture: pictureUrl,
    },
  });
}
