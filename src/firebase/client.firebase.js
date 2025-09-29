import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// (Analytics is optional and requires HTTPS + gtag; skip for now)

const appConfig = {
  apiKey:        import.meta.env.VITE_FB_API_KEY,
  authDomain:    import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId:     import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
  measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(appConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
