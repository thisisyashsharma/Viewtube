//EU7u1.p2.a1.38ln - Auth toggle firebase/mongo
// Minimal, safe initializer for Firebase Admin.
// Returns null if env/keys are missing so we can gracefully fall back.

import admin from "firebase-admin";

let _admin = null;

export function getAdminOrNull() {
  if (_admin) return _admin;
  try {
    const {
      FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY,
    } = process.env;

    if (
      !FIREBASE_PROJECT_ID ||
      !FIREBASE_CLIENT_EMAIL ||
      !FIREBASE_PRIVATE_KEY
    ) {
      return null;
    }

    _admin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });

    return _admin;
  } catch {
    return null;
  }
}
