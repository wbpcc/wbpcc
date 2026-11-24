"use client";

// Public forms → database. Anyone may SEND (firestore.rules checks every field);
// only Admins can READ. After saving, the server is asked to email an alert
// to the party inbox — it checks the submission really exists first.
import { LIVE, loadFirebase } from "@/components/session";

const clean = (o) => JSON.parse(JSON.stringify(o)); // drops undefined / empty extras
const shortRef = (prefix, id) => `${prefix}-${id.slice(0, 6).toUpperCase()}`;

/**
 * Save one form submission. Returns { ref } — a short reference to show the person.
 * Throws if it couldn't be saved (show a "please try again" message).
 */
export async function submitForm(col, data, prefix = "WB", { notify = true } = {}) {
  if (!LIVE) return { ref: shortRef(prefix, Math.random().toString(36).slice(2, 10)), demo: true };
  const [{ db }, m] = await Promise.all([loadFirebase(), import("firebase/firestore")]);
  const doc = await m.addDoc(m.collection(db, col), { ...clean(data), createdAt: m.serverTimestamp() });
  // Email alert — never blocks or fails the form.
  if (notify) {
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ col, id: doc.id }),
      keepalive: true,
    }).catch(() => {});
  }
  return { ref: shortRef(prefix, doc.id), id: doc.id };
}

/**
 * Sign a petition: saves the signature (Admins only can read it), then asks the
 * server to add 1 to the public count. Returns { ref, counted }.
 */
export async function signPetition(pid, data) {
  const res = await submitForm(`petitions/${pid}/signatures`, data, "SIG", { notify: false });
  if (res.demo) return { ...res, counted: true };
  let counted = false;
  try {
    const r = await fetch("/api/count-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid, sid: res.id }),
    });
    counted = !!(await r.json()).counted;
  } catch {}
  return { ...res, counted };
}

/** The petition's current public signature count (null if it can't be read). */
export async function liveSignatureCount(pid) {
  if (!LIVE) return null;
  try {
    const [{ db }, m] = await Promise.all([loadFirebase(), import("firebase/firestore")]);
    const snap = await m.getDoc(m.doc(db, "petitions", pid));
    const n = snap.exists() ? snap.data().signatures : null;
    return typeof n === "number" ? n : null;
  } catch {
    return null;
  }
}

/** Text fields from a <form>, trimmed; empty ones left out. */
export function fieldsOf(form, names) {
  const fd = new FormData(form);
  const out = {};
  for (const n of names) {
    const v = fd.get(n);
    if (typeof v === "string" && v.trim()) out[n] = v.trim();
  }
  return out;
}

/** "Couldn't send" message in the page language. */
export const SEND_ERROR = {
  en: "Couldn't send. Please check your internet connection and try again.",
  bn: "পাঠানো যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।",
  hi: "भेजा नहीं जा सका। इंटरनेट कनेक्शन जाँचकर फिर कोशिश करें।",
};
export const SENDING = { en: "Sending…", bn: "পাঠানো হচ্ছে…", hi: "भेजा जा रहा है…" };

export { LIVE };
