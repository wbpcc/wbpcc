"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------
// Who is signed in.
//  LIVE (Firebase configured): real logins. The access level comes from the
//  "role" stamped on the login by an Admin — member | contributor | admin.
//  DEMO (no Firebase settings): the old click-through preview in localStorage.
//
// useSession() → undefined while loading, null when signed out, otherwise
//   { role: "member" | "team", level: "member" | "contributor" | "admin", email, uid, name }
// ---------------------------------------------------------------------
import { LIVE } from "@/lib/live";
export { LIVE };

/** Members sign in with a mobile number; Firebase stores it as this email. */
export const memberEmail = (mobile) => `${String(mobile).replace(/\D/g, "").slice(-10)}@member.wbpcc.org`;

// Firebase is loaded only when something needs it, so pages stay light.
let fbPromise;
export function loadFirebase() {
  fbPromise ||= Promise.all([import("@/lib/firebase/client"), import("firebase/auth")]).then(([c, authMod]) => {
    const f = c.firebase();
    if (!f) throw new Error("Firebase is not configured");
    return { ...f, authMod };
  });
  return fbPromise;
}

// ---- live state, shared by every component on the page ----
let current; // undefined until Firebase answers
let started = false;
const listeners = new Set();
const emit = (s) => { current = s; listeners.forEach((f) => f(s)); };

function startLive() {
  if (started) return;
  started = true;
  loadFirebase()
    .then(({ auth, authMod }) => {
      authMod.onIdTokenChanged(auth, async (u) => {
        if (!u) return emit(null);
        const { claims } = await u.getIdTokenResult();
        const level = claims.role;
        if (!["member", "contributor", "admin"].includes(level)) return emit(null); // signed in but no access level
        emit({ role: level === "member" ? "member" : "team", level, email: u.email, uid: u.uid, name: u.displayName || "" });
      });
    })
    .catch(() => emit(null));
}

// ---- demo state ----
const KEY = "wbpcc-demo-session";
const EVT = "wbpcc-session";
export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
export function setSession(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  window.dispatchEvent(new Event(EVT));
}

export function useSession() {
  const [s, setS] = useState(undefined); // undefined = not loaded yet
  useEffect(() => {
    if (LIVE) {
      startLive();
      listeners.add(setS);
      if (current !== undefined) setS(current);
      return () => { listeners.delete(setS); };
    }
    const read = () => setS(getSession());
    read();
    window.addEventListener(EVT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(EVT, read); window.removeEventListener("storage", read); };
  }, []);
  return s;
}

export async function clearSession() {
  try { localStorage.removeItem(KEY); localStorage.removeItem("wbpcc-console-role"); } catch {}
  if (LIVE) {
    const { auth, authMod } = await loadFirebase();
    await authMod.signOut(auth);
  } else {
    window.dispatchEvent(new Event(EVT));
  }
}

const fail = (code) => Object.assign(new Error(code), { code });

/**
 * Sign in for one category. Members use their mobile number (or an email);
 * Contributors and Admins use their email. Returns the access level.
 * The login must actually have that category — otherwise it's signed out again.
 */
export async function signIn(cat, id, password) {
  const raw = String(id).trim();
  let email = raw;
  if (cat === "member" && !raw.includes("@")) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10) throw fail(/^wb-/i.test(raw) ? "use-mobile" : "bad-mobile");
    email = memberEmail(digits);
  }
  const { auth, authMod } = await loadFirebase();
  const cred = await authMod.signInWithEmailAndPassword(auth, email, password);
  const { claims } = await cred.user.getIdTokenResult(true);
  const level = claims.role;
  const ok = cat === "member" ? ["member", "contributor", "admin"].includes(level)
    : cat === "contributor" ? ["contributor", "admin"].includes(level)
    : level === "admin";
  if (!ok) { await authMod.signOut(auth); throw fail("wrong-category"); }
  return level;
}

export async function resetPassword(email) {
  const { auth, authMod } = await loadFirebase();
  await authMod.sendPasswordResetEmail(auth, String(email).trim());
}

/** Fresh ID token of the signed-in person, for calling our own API routes. */
export async function idToken() {
  const { auth } = await loadFirebase();
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
