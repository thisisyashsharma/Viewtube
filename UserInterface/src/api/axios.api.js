import axios from 'axios';

const { auth } = await import("../firebase/client.firebase.js");

// axios.defaults.baseURL = 'http://localhost:8000/api/v1';
// axios.defaults.withCredentials = true;


const api = axios.create({
    baseURL: "/api/v1" || "http://localhost:8000/api/v1" ,
    withCredentials: true, // needed for MongoDB cookie-JWT; harmless for Firebase
});

//EU7u1.p5.a1.27ln - Auth toggle firebase/mongo 
// 🔹 attach Firebase ID token only when provider is set to firebase
api.interceptors.request.use(async (config) => {
  try {
    if (window?.__AUTH_PROVIDER__ === "firebase" || window?.__AUTH_PROVIDER__ === "auto") {
      const { auth } = await import("../firebase/client.firebase.js");
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(false);
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (_) {
    // keep request as-is if anything goes wrong (Mongo fallback)
  }
  return config;
});

export default api;
