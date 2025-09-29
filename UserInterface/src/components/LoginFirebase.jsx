// EU7u1.p8.a1.21ln - Auth toggle firebase/mongo - direct google signup page

import { auth, googleProvider } from "../firebase/client.firebase.js";
import { signInWithPopup, signOut, getAuth } from "firebase/auth";

export default function LoginFirebase() {
  if (window.__AUTH_PROVIDER__ !== "firebase") return null;

  const loginGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };
  const logout = async () => {
    await signOut(auth);
  };

  const user = auth.currentUser;

  const current = getAuth().currentUser;
  return (
    <div>
      {user ? (
        <>
          <div>
            Signed in as <b>{user.email || user.uid}</b>
          </div>
          <div>(Debug: {current?.email})</div>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={loginGoogle}>Continue with Google</button>
      )}
    </div>
  );
}
