import webpush from "web-push";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

if (!vapidPublicKey) {
  throw new Error(
    "VAPID_PUBLIC_KEY nije definisan u environment varijablama."
  );
}

if (!vapidPrivateKey) {
  throw new Error(
    "VAPID_PRIVATE_KEY nije definisan u environment varijablama."
  );
}

if (!vapidSubject) {
  throw new Error(
    "VAPID_SUBJECT nije definisan u environment varijablama."
  );
}

webpush.setVapidDetails(
  vapidSubject,
  vapidPublicKey,
  vapidPrivateKey
);

export default webpush;
