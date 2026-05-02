import admin from "firebase-admin";

function getAdmin() {
  if (admin.apps.length) {
    return admin;
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    console.warn(
      "FIREBASE_SERVICE_ACCOUNT nije definisan (API će raditi samo u runtime-u)"
    );
    return admin;
  }

  try {
    const parsed = JSON.parse(serviceAccount);

    admin.initializeApp({
      credential: admin.credential.cert(parsed),
    });
  } catch (e) {
    console.error("Nevalidan FIREBASE_SERVICE_ACCOUNT JSON", e);
  }

  return admin;
}

export default getAdmin;
