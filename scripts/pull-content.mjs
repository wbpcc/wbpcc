// Runs automatically before `npm run dev` and `npm run build`.
// Downloads the latest PUBLISHED website content from Firestore into
// src/data/live-content.json, which the data files read. If Firebase isn't
// configured, it writes {"ok": false} and the site uses its built-in content.
//
// Credentials (first one found):
//   FIRESTORE_EMULATOR_HOST       → local emulator
//   FIREBASE_SERVICE_ACCOUNT      → the key JSON on one line (Vercel)
//   FIREBASE_KEY_FILE             → path to the key file (your computer, set in .env.local)
import { writeFileSync, readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const OUT = new URL("../src/data/live-content.json", import.meta.url);
const LISTS = ["leaders", "districtPresidents", "groups", "events", "posts", "campaigns", "petitions", "inspiration", "offices"];
const META = ["status", "updatedAt", "updatedBy", "createdAt"];
const onVercel = !!process.env.VERCEL;

function write(obj) { writeFileSync(OUT, JSON.stringify(obj, null, onVercel ? 0 : 1)); }

function credentials() {
  if (process.env.FIRESTORE_EMULATOR_HOST) return { projectId: process.env.FIREBASE_PROJECT_ID || "demo-wbpcc", how: "emulator" };
  let key = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) key = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  else if (process.env.FIREBASE_KEY_FILE) key = JSON.parse(readFileSync(process.env.FIREBASE_KEY_FILE, "utf8"));
  if (!key) return null;
  return { projectId: key.project_id, credential: cert(key), how: "key" };
}

// Firestore Timestamps → ISO strings so the JSON is plain data.
function plain(v) {
  if (v instanceof Timestamp) return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

async function main() {
  const c = credentials();
  if (!c) {
    write({ ok: false });
    console.log("ℹ️  Content: Firebase not configured — using the built-in placeholder content.");
    return;
  }
  initializeApp({ projectId: c.projectId, ...(c.credential ? { credential: c.credential } : {}) });
  const db = getFirestore();
  const now = Date.now();
  const out = { ok: true, project: c.projectId, pulledAt: new Date(now).toISOString(), pages: {} };

  for (const col of LISTS) {
    const snap = await db.collection(col).where("status", "==", "published").get();
    out[col] = snap.docs
      .map((d) => plain({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((x) => { for (const k of META) delete x[k]; return x; });
  }
  // Events: real start dates; "hours from now" is worked out at build for server-side filters.
  out.events = out.events.map((e) => (e.startsAt ? { ...e, startInHours: (Date.parse(e.startsAt) - now) / 3600e3 } : e));

  const pages = await db.collection("pages").get();
  for (const d of pages.docs) {
    const x = plain(d.data());
    if (x.status !== "published") continue;
    for (const k of [...META, "order"]) delete x[k];
    out.pages[d.id] = x;
  }

  write(out);
  const n = LISTS.reduce((s, k) => s + out[k].length, 0) + Object.keys(out.pages).length;
  console.log(`✅ Content: ${n} items from "${c.projectId}" (${c.how}).`);
}

main().catch((e) => {
  // On Vercel, fail the build so the previous (correct) version stays live
  // instead of silently going back to placeholder content.
  if (onVercel) { console.error("❌ Could not load content from Firebase:", e.message); process.exit(1); }
  write({ ok: false });
  console.warn(`⚠️  Content: couldn't reach Firebase (${e.message}) — using built-in placeholder content.`);
});
