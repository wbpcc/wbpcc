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

/**
 * Newest-first list of a private collection (inbox, appointments, applications…).
 * Admins only — the rules refuse anyone else. Returns [list, setList, state].
 */
export function useAdminList(col, seed = [], max = 300) {
  const [list, setList] = useState(seed);
  const [state, setState] = useState(LIVE ? "loading" : "demo");
  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    (async () => {
      try {
        const { db, m } = await fs();
        const snap = await m.getDocs(m.query(m.collection(db, col), m.orderBy("createdAt", "desc"), m.limit(max)));
        if (!alive) return;
        setList(snap.docs.map((d) => plain({ id: d.id, ...d.data() })));
        setState("ready");
      } catch (e) {
        console.error(`Loading ${col} failed`, e);
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, [col, max]);
  return [list, setList, state];
}

/** Change a few fields of one record (e.g. status) and log who did it. */
export async function patchItem(col, id, data, label) {
  if (!LIVE) return;
  const { db, auth, m } = await fs();
  await m.updateDoc(m.doc(db, col, id), { ...clean(data), handledBy: auth.currentUser.email, handledAt: m.serverTimestamp() });
  await audit(label, `${col}/${id}`);
}

/* ------------------------- Contributor submissions ------------------------- */

/** The signed-in contributor's own submissions, newest first. [list, setList, state] */
export function useOwnSubmissions(seed = []) {
  const [list, setList] = useState(seed);
  const [state, setState] = useState(LIVE ? "loading" : "demo");
  useEffect(() => {
    if (!LIVE) return;
    let alive = true;
    (async () => {
      try {
        const { db, auth, m } = await fs();
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("not signed in");
        const snap = await m.getDocs(m.query(m.collection(db, "submissions"), m.where("authorUid", "==", uid), m.orderBy("createdAt", "desc")));
        if (!alive) return;
        setList(snap.docs.map((d) => plain({ id: d.id, ...d.data() })));
        setState("ready");
      } catch (e) {
        console.error("Loading submissions failed", e);
        if (alive) setState("error");
      }
    })();
    return () => { alive = false; };
  }, []);
  return [list, setList, state];
}

function alertSubmitted(id) {
  fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ col: "submissions", id }), keepalive: true }).catch(() => {});
}

/** Contributor: create a submission as draft or straight for review. Returns its id. */
export async function createSubmission(data, submit) {
  if (!LIVE) return `demo-${Date.now()}`;
  const { db, auth, m } = await fs();
  const u = auth.currentUser;
  const ref = await m.addDoc(m.collection(db, "submissions"), {
    ...clean(data), status: submit ? "pending" : "draft", authorUid: u.uid, authorEmail: u.email,
    createdAt: m.serverTimestamp(), updatedAt: m.serverTimestamp(),
    ...(submit ? { submittedAt: m.serverTimestamp() } : {}),
  });
  await audit(submit ? "Submitted for review" : "Saved a draft", `submissions/${ref.id}`);
  if (submit) alertSubmitted(ref.id);
  return ref.id;
}

/** Contributor: edit own submission (draft / waiting / sent back), optionally (re)submitting it. */
export async function updateSubmission(id, data, submit) {
  if (!LIVE) return;
  const { db, m } = await fs();
  const { id: _id, status, authorUid, authorEmail, createdAt, reviewNote, reviewedBy, reviewedAt, publishedId, publishedCol, handledBy, handledAt, notifiedAt, submittedAt, updatedAt, ...fields } = data;
  await m.updateDoc(m.doc(db, "submissions", id), {
    ...clean(fields), status: submit ? "pending" : "draft", updatedAt: m.serverTimestamp(),
    ...(submit ? { submittedAt: m.serverTimestamp() } : {}),
  });
  await audit(submit ? "Submitted for review" : "Saved a draft", `submissions/${id}`);
  if (submit) alertSubmitted(id);
}

/** Contributor: delete own draft. */
export async function deleteSubmission(id) {
  if (!LIVE) return;
  const { db, m } = await fs();
  await m.deleteDoc(m.doc(db, "submissions", id));
  await audit("Deleted a draft", `submissions/${id}`);
}

/**
 * Admin: accept a submission — create the real website item (published), then
 * mark the submission accepted. Returns { col, id } of the new website item.
 */
export async function acceptSubmission(sub) {
  const { publicDocFor } = await import("./submissions");
  const { col, doc } = publicDocFor(sub);
  if (!LIVE) return { col, id: doc.id };
  const order = -Math.floor(Date.now() / 1000); // newest first
  await saveItem(col, doc, { order, label: `${sub.kind} “${sub.title?.en || doc.id}” (from a contributor)` });
  await patchItem("submissions", sub.id, { status: "accepted", publishedId: doc.id, publishedCol: col, reviewedAt: new Date().toISOString() }, `Accepted submission → ${col}/${doc.id}`);
  return { col, id: doc.id };
}

/** Call one of our Admin-only server routes with the signed-in Admin's token. → { status, ...json } */
export async function adminApi(path, body) {
  const token = await idToken();
  const r = await fetch(path, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, ...j };
}

/** Record any Admin action in the audit log (e.g. "Downloaded signatures"). */
export async function logAction(action, target) {
  if (!LIVE) return;
  try { await audit(action, target); } catch (e) { console.error("audit failed", e); }
}

/** Record in the audit log that an Admin opened a private record (e.g. a member application). */
export async function logView(col, id, label) {
  if (!LIVE) return;
  try { await audit(`Opened ${label}`, `${col}/${id}`); } catch (e) { console.error("audit failed", e); }
}

/**
 * Live count of records matching every [field, value] pair (dashboard numbers).
 * null while loading. useLiveCount("inbox", ["status", "new"])
 */
export function useLiveCount(col, ...pairs) {
  const [n, setN] = useState(null);
  const key = JSON.stringify(pairs);
  useEffect(() => {
    if (!LIVE || !col) return; // col = null → skip (e.g. not an Admin)
    let alive = true;
    (async () => {
      try {
        const { db, m } = await fs();
        const q = m.query(m.collection(db, col), ...pairs.map(([f, v]) => m.where(f, "==", v)));
        const snap = await m.getCountFromServer(q);
        if (alive) setN(snap.data().count);
      } catch (e) {
        console.error(`Counting ${col} failed`, e);
        if (alive) setN("–");
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col, key]);
  return n;
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
export async function saveItem(col, item, { order, label, status = "published", merge = false }) {
  if (!LIVE) return;
  const { db, auth, m } = await fs();
  const { id, ...rest } = item;
  // merge: keep fields this save doesn't mention (e.g. a petition's live signature count).
  await m.setDoc(m.doc(db, col, id), {
    ...clean(rest), status, order: order ?? rest.order ?? 0,
    updatedAt: m.serverTimestamp(), updatedBy: auth.currentUser.email,
  }, { merge });
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
