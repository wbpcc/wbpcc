// One-time setup of the REAL (online) Firebase project.
//
//   npm run live:content -- --project <id> --key <path-to-key.json>
//       Loads the website's current content. Never overwrites: anything that
//       already exists online (e.g. edited by an Admin) is skipped.
//
//   npm run live:admin -- --project <id> --key <path-to-key.json> --email <email> [--name "Name"]
//       Makes that email an Admin and prints a one-time link to set its password.
//       Every later login (admins, contributors, members) is made from the console.
//
// The key is the service-account JSON from Firebase → Project settings →
// Service accounts. Keep it OUTSIDE this folder; never commit or share it.
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getSecurityRules } from "firebase-admin/security-rules";
import { contentDocs } from "./content.mjs";

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (n) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : undefined; };
const fail = (msg) => { console.error(`✋ ${msg}`); process.exit(1); };

if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  fail("Emulator settings are switched on in this terminal. Open a fresh terminal for the live project.");
}
const project = flag("project");
const keyPath = flag("key");
if (!["rules", "content", "admin"].includes(cmd) || !project || !keyPath) {
  fail("Usage:\n  npm run live:rules -- --project <id> --key <key.json>\n  npm run live:content -- --project <id> --key <key.json>\n  npm run live:admin -- --project <id> --key <key.json> --email <email> [--name \"Name\"]");
}
if (project.startsWith("demo-")) fail(`"${project}" is the local demo id — use the real project id.`);

let key;
try { key = JSON.parse(readFileSync(keyPath, "utf8")); }
catch { fail(`Could not read the key file at ${keyPath}`); }
if (key.project_id !== project) fail(`That key belongs to "${key.project_id}", not "${project}". Check you downloaded it from the right project.`);

initializeApp({ credential: cert(key), projectId: project });
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = getAuth();

async function loadContent() {
  const docs = contentDocs(new Date(), "setup");
  console.log(`Loading website content into "${project}" (existing documents are kept)…`);
  let added = 0, kept = 0;
  for (const d of docs) {
    try { await db.collection(d.col).doc(d.id).create(d.data); added++; }
    catch (e) { if (e.code === 6) kept++; else throw e; } // 6 = ALREADY_EXISTS
  }
  await db.collection("audit").add({
    actorUid: "setup", actorEmail: "setup script", action: "Loaded starting content",
    target: `${added} added, ${kept} kept`, createdAt: FieldValue.serverTimestamp(),
  });
  console.log(`✅ ${added} added, ${kept} already there (left untouched).`);
}

async function makeAdmin() {
  const email = (flag("email") || "").trim().toLowerCase();
  const name = flag("name") || "Admin";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("Give a valid --email");

  let user, created = false;
  try { user = await auth.getUserByEmail(email); }
  catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    user = await auth.createUser({ email, displayName: name }); // no password — they set it via the link
    created = true;
  }
  await auth.setCustomUserClaims(user.uid, { role: "admin" });
  await db.collection("staff").doc(user.uid).set(
    { email, name, role: "admin", active: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  await db.collection("audit").add({
    actorUid: "setup", actorEmail: "setup script", action: created ? "Created Admin login" : "Made existing login an Admin",
    target: email, createdAt: FieldValue.serverTimestamp(),
  });

  const link = await auth.generatePasswordResetLink(email);
  console.log(`✅ ${email} is now an Admin${created ? " (new login)" : ""}.`);
  console.log("\nOpen this link ONCE to set the password (it expires in about an hour; don't share it):\n");
  console.log(link + "\n");
}

// Publishes firestore.rules with the server key (no Firebase CLI login needed).
async function publishRules() {
  const source = readFileSync("firestore.rules", "utf8");
  console.log(`Publishing firestore.rules to "${project}"…`);
  const ruleset = await getSecurityRules().releaseFirestoreRulesetFromSource(source);
  console.log(`✅ Rules are live (ruleset ${ruleset.name.split("/").pop()}).`);
}

({ rules: publishRules, content: loadContent, admin: makeAdmin })[cmd]()
  .catch((e) => fail(`Failed: ${e.message}`));
