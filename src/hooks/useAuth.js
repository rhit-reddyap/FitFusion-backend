import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, googleProvider, db } from "../auth/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AUTH_EXP_KEY = "ff-auth-expires-at-v1";
const HUNDRED_DAYS_MS = 100 * 24 * 60 * 60 * 1000;

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const val = useProvideAuth();
  return <AuthCtx.Provider value={val}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      // Enforce 100-day max session
      const exp = Number(localStorage.getItem(AUTH_EXP_KEY) || 0);
      const now = Date.now();

      if (!u) {
        setUser(null);
        setReady(true);
        return;
      }

      if (!exp || now > exp) {
        await signOut(auth);
        localStorage.removeItem(AUTH_EXP_KEY);
        setUser(null);
        setReady(true);
        return;
      }

      // Ensure user doc exists
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: u.uid,
          email: u.email || null,
          createdAt: serverTimestamp(),
          premium_end: null,
          source: null,
        });
      }

      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, []);

  const value = useMemo(() => {
    const signInEmail = async (email, pass, create = false) => {
      let cred;
      if (create) cred = await createUserWithEmailAndPassword(auth, email, pass);
      else cred = await signInWithEmailAndPassword(auth, email, pass);
      localStorage.setItem(AUTH_EXP_KEY, String(Date.now() + HUNDRED_DAYS_MS));
      return cred.user;
    };

    const signInGoogle = async () => {
      const res = await signInWithPopup(auth, googleProvider);
      localStorage.setItem(AUTH_EXP_KEY, String(Date.now() + HUNDRED_DAYS_MS));
      return res.user;
    };

    const logout = async () => {
      localStorage.removeItem(AUTH_EXP_KEY);
      await signOut(auth);
    };

    return { user, ready, signInEmail, signInGoogle, logout };
  }, [user, ready]);

  return value;
}
