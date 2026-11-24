// Server-only Firestore access over plain HTTPS (no firebase-admin — its
// database library doesn't package reliably into Vercel functions).
// Uses the service account to get a short-lived Google access token.
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

function serviceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (process.env.FIREBASE_KEY_FILE) return JSON.parse(readFileSync(process.env.FIREBASE_KEY_FILE, "utf8"));
  return null;
}

const emulator = () => process.env.FIRESTORE_EMULATOR_HOST;

export function projectId() {
  if (emulator()) return process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "demo-wbpcc";
  return serviceAccount()?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
}

export const serverReady = () => !!(emulator() || serviceAccount());

let cached = { token: null, exp: 0 };
/** Short-lived Google access token for the service account (database + logins). */
export async function accessToken() {
  if (emulator()) return "owner"; // the emulator's "bypass rules" token
  if (cached.token && Date.now() < cached.exp - 60_000) return cached.token;
  const sa = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email, scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`token: ${j.error || r.status}`);
  cached = { token: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

const base = () => (emulator() ? `http://${emulator()}` : "https://firestore.googleapis.com")
  + `/v1/projects/${projectId()}/databases/(default)/documents`;

/** One document as plain values, or null if it doesn't exist. */
export async function getDoc(path) {
  const r = await fetch(`${base()}/${path}`, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: "no-store" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`get ${path}: ${r.status}`);
  const j = await r.json();
  return Object.fromEntries(Object.entries(j.fields || {}).map(([k, v]) => [k, fromValue(v)]));
}

/** Set a few top-level fields on an existing document. */
export async function setFields(path, fields) {
  const mask = Object.keys(fields).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const r = await fetch(`${base()}/${path}?${mask}&currentDocument.exists=true`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toValue(v)])) }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`patch ${path}: ${r.status}`);
}

const fieldsOf = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined).map(([k, v]) => [k, toValue(v)]));

/** Create or completely replace a document. */
export async function writeDoc(path, data) {
  const r = await fetch(`${base()}/${path}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: fieldsOf(data) }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`write ${path}: ${r.status}`);
}

/** Add a document with an automatic id (e.g. an audit entry). */
export async function addDoc(colPath, data) {
  const r = await fetch(`${base()}/${colPath}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: fieldsOf(data) }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`add ${colPath}: ${r.status}`);
}

/** Delete a document (no error if it's already gone). */
export async function deleteDoc(path) {
  const r = await fetch(`${base()}/${path}`, { method: "DELETE", headers: { Authorization: `Bearer ${await accessToken()}` }, cache: "no-store" });
  if (!r.ok && r.status !== 404) throw new Error(`delete ${path}: ${r.status}`);
}

/** Full resource name of a document, for commit() writes. */
export const docName = (path) => `projects/${projectId()}/databases/(default)/documents/${path}`;

/** Several writes that all succeed or all fail together (Firestore REST :commit). */
export async function commit(writes) {
  const url = (emulator() ? `http://${emulator()}` : "https://firestore.googleapis.com")
    + `/v1/projects/${projectId()}/databases/(default)/documents:commit`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ writes }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`commit: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

function fromValue(v) {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromValue(x)]));
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  return undefined;
}
function toValue(v) {
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (v && typeof v === "object") return { mapValue: { fields: fieldsOf(v) } };
  return { nullValue: null };
}
