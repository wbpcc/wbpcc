"use client";

// Console ↔ database. Every save is checked by firestore.rules (only Admins
// can change website content) and written to the audit log.
import { useEffect, useState } from "react";
import { LIVE, loadFirebase, idToken } from "@/components/session";

let fsPromise;
function fs() {
  fsPromise ||= Promise.all([loadFirebase(), import("firebase/firestore")]).then(([f, m]) => ({ db: f.db, auth: f.auth, m }));
  return fsPromise;
}

const META = ["updatedAt", "updatedBy", "createdAt"];

// Firestore Timestamps → ISO strings, so editors work with plain data.
function plain(v) {
  if (v && typeof v.toDate === "function") return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}
// Drops undefined values / functions (Firestore refuses undefined).
const clean = (o) => JSON.parse(JSON.stringify(o));

/**
 * A list for an editor. Starts with the built-in data, then (LIVE) replaces it
 * with what's actually in the database. Returns [list, setList, state].
 * state: "demo" | "loading" | "ready" | "error"
 */
export function useLiveList(col, seed, prep = (x) => x) {
  const [list, setList] = useState(() => seed.map((x) => prep({ ...x })));
  const [state, setState] = useState(LIVE ? "loading" : "demo");
  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    (async () => {
      try {
        const { db, m } = await fs();
        const snap = await m.getDocs(m.collection(db, col));
        if (!alive) return;
        const items = snap.docs
          .map((d) => plain({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((x) => { for (const k of META) delete x[k]; return prep(x); });
        setList(items);
        setState("ready");
      } catch (e) {
        console.error(`Loading ${col} failed`, e);
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col]);
  return [list, setList, state];
}

/**
 * Page sections for an editor: loads pages/{id} for each id given.
 * Returns [docs, state] — docs is { id: data | null }, state as useLiveList.
 * In DEMO mode docs stay empty and the editor keeps its built-in values.
 */
export function useLiveDocs(ids) {
  const key = ids.join(",");
  const [docs, setDocs] = useState({});
  const [state, setState] = useState(LIVE ? "loading" : "demo");
  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    (async () => {
      try {
        const { db, m } = await fs();
        const snaps = await Promise.all(ids.map((id) => m.getDoc(m.doc(db, "pages", id))));
        if (!alive) return;
        setDocs(Object.fromEntries(snaps.map((s, i) => [ids[i], s.exists() ? plain(s.data()) : null])));
        setState("ready");
      } catch (e) {
        console.error("Loading page sections failed", e);
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [docs, state];
}

async function audit(action, target) {
  const { db, auth, m } = await fs();
  const u = auth.currentUser;
  await m.addDoc(m.collection(db, "audit"), {
    actorUid: u.uid, actorEmail: u.email, action, target, createdAt: m.serverTimestamp(),
  });
}

/**
 * Save (add or update) one item of a website list.
 * status "published" shows it on the website; "draft" keeps it Admin-only.
 */
export async function saveItem(col, item, { order, label, status = "published" }) {
  if (!LIVE) return;
  const { db, auth, m } = await fs();
  const { id, ...rest } = item;
  await m.setDoc(m.doc(db, col, id), {
    ...clean(rest), status, order: order ?? rest.order ?? 0,
    updatedAt: m.serverTimestamp(), updatedBy: auth.currentUser.email,
  });
  await audit(`Saved ${label}`, `${col}/${id}`);
}

/** Remove one item from a website list. */
export async function removeItem(col, id, label) {
  if (!LIVE) return;
  const { db, m } = await fs();
  await m.deleteDoc(m.doc(db, col, id));
  await audit(`Removed ${label}`, `${col}/${id}`);
}

/** Save fields of a page section (pages/{pageId}). */
export async function savePage(pageId, data, label) {
  if (!LIVE) return;
  const { db, auth, m } = await fs();
  await m.setDoc(m.doc(db, "pages", pageId), {
    ...clean(data), status: "published", updatedAt: m.serverTimestamp(), updatedBy: auth.currentUser.email,
  }, { merge: true });
  await audit(`Edited ${label}`, `pages/${pageId}`);
}

/**
 * Ask the server to rebuild the public website with the latest content.
 * → { ok, rebuilding } — rebuilding is false until the Vercel deploy hook is set.
 */
export async function requestPublish() {
  if (!LIVE) return { ok: true, rebuilding: false, demo: true };
  let res;
  try {
    const token = await idToken();
    const r = await fetch("/api/publish", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    res = await r.json();
  } catch {
    res = { ok: false, rebuilding: false, reason: "unreachable" };
  }
  if (res.rebuilding) audit("Started website update", "website").catch(() => {});
  return res;
}

/** The message an editor shows after saving. */
export function savedMessage(res, what = "Saved") {
  if (!LIVE || res?.demo) return `${what} (preview only — nothing is stored)`;
  if (res?.rebuilding) return `${what}. The website updates in about 2 minutes.`;
  if (res?.reason === "no-deploy-hook") return `${what} to the database. Auto-update isn't set up (VERCEL_DEPLOY_HOOK_URL), so the public site shows it after the next deploy.`;
  const why = [res?.reason || "unknown", res?.detail].filter(Boolean).join(": ");
  return `${what} to the database, but the website update didn't start (${why}). It will show after the next deploy.`;
}

export { LIVE };
