import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let serviceAccount;
try {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64) {
    serviceAccount = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  }
} catch (e) {
  console.error("FIREBASE_SERVICE_ACCOUNT_B64 is invalid or missing");
}

if (!getApps().length && serviceAccount) {
  initializeApp({ credential: cert(serviceAccount) });
}

export const auth = getAuth();
