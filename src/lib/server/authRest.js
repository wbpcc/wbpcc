// Server-only: logins via Google's sign-in service (Identity Toolkit REST).
// No firebase-admin — it doesn't package reliably into Vercel functions.
import { accessToken, projectId } from "./firestoreRest";

const authEmu = () => process.env.FIREBASE_AUTH_EMULATOR_HOST;
const root = () => (authEmu() ? `http://${authEmu()}/identitytoolkit.googleapis.com` : "https://identitytoolkit.googleapis.com");
const apiKey = () => (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key").trim();

/** Members sign in with their mobile; Firebase stores it as this email (same rule as the browser). */
export const memberEmail = (mobile) => `${String(mobile).replace(/\D/g, "").slice(-10)}@member.wbpcc.org`;
export const tenDigits = (mobile) => String(mobile || "").replace(/\D/g, "").slice(-10);

async function admin(path, body) {
  const r = await fetch(`${root()}/v1/projects/${projectId()}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j?.error?.message || `HTTP ${r.status}`), { code: j?.error?.message || `HTTP_${r.status}` });
  return j;
}

/** Create a login with no password yet. Throws code EMAIL_EXISTS if it already exists. */
export async function createUser({ email, displayName }) {
  const j = await admin("accounts", { email, displayName, emailVerified: false });
  return j.localId;
}

/** Find a login by email → { uid, email, role } or null. */
export async function findUserByEmail(email) {
  const j = await admin("accounts:lookup", { email: [email] });
  const u = j.users?.[0];
  if (!u) return null;
  let claims = {};
  try { claims = JSON.parse(u.customAttributes || "{}"); } catch {}
  return { uid: u.localId, email: u.email, role: claims.role, hasPassword: !!u.passwordHash || (u.providerUserInfo || []).some((p) => p.providerId === "password") };
}

/** Set the access level (custom claim "role") on a login. */
export const setRole = (uid, role) => admin("accounts:update", { localId: uid, customAttributes: JSON.stringify({ role }) });

/** Set a login's password. */
export const setPassword = (uid, password) => admin("accounts:update", { localId: uid, password });

/**
 * Check a browser's sign-in token with Google → { uid, email, role }.
 * Google only answers for a genuine, unexpired token.
 */
export async function verifyIdToken(token) {
  const r = await fetch(`${root()}/v1/accounts:lookup?key=${encodeURIComponent(apiKey())}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error("bad token"), { detail: body?.error?.message || `HTTP ${r.status}` });
  const u = body.users?.[0];
  if (!u) throw Object.assign(new Error("no user"), { detail: "USER_NOT_FOUND" });
  let claims = {};
  try { claims = JSON.parse(u.customAttributes || "{}"); } catch {}
  return { uid: u.localId, email: u.email, role: claims.role };
}

/** The signed-in Admin making this request, or a Response to send back. */
export async function requireAdmin(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { error: Response.json({ ok: false, reason: "signed-out" }, { status: 401 }) };
  try {
    const user = await verifyIdToken(token);
    if (user.role !== "admin") return { error: Response.json({ ok: false, reason: "not-admin" }, { status: 403 }) };
    return { user };
  } catch (e) {
    return { error: Response.json({ ok: false, reason: "bad-token", detail: e.detail }, { status: 401 }) };
  }
}
