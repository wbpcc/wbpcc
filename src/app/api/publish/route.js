// POST /api/publish — an Admin saved something in the console; rebuild the
// public website so it shows the new content (Vercel deploy hook).
//
// Only a signed-in Admin can trigger it: the browser sends its Firebase ID
// token and we check the "admin" role on it here, on the server.
//
// Deliberately uses ONLY firebase-admin's login checker (no database): checking
// a token needs just the project id, and the database library doesn't package
// cleanly into Vercel functions. The console writes the audit entry itself.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status });

const projectId = () =>
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
  || (process.env.FIREBASE_AUTH_EMULATOR_HOST ? "demo-wbpcc" : "");

async function verify(token) {
  const { initializeApp, getApps } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const app = getApps().find((a) => a.name === "publish") || initializeApp({ projectId: projectId() }, "publish");
  return getAuth(app).verifyIdToken(token);
}

export async function POST(req) {
  try {
    if (!projectId()) return json({ ok: false, rebuilding: false, reason: "server-not-configured" }, 503);

    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: false, reason: "signed-out" }, 401);

    let user;
    try { user = await verify(token); }
    catch { return json({ ok: false, reason: "bad-token" }, 401); }
    if (user.role !== "admin") return json({ ok: false, reason: "not-admin" }, 403);

    const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
    if (!hook) return json({ ok: true, rebuilding: false, reason: "no-deploy-hook" });

    let ok = false;
    try { ok = (await fetch(hook, { method: "POST" })).ok; } catch {}
    return json({ ok, rebuilding: ok, reason: ok ? undefined : "hook-failed" });
  } catch (e) {
    console.error("publish failed", e);
    return json({ ok: false, rebuilding: false, reason: "server-error", code: e.code || e.name }, 500);
  }
}

export function GET() {
  return json({ ok: true, info: "POST with an Admin's sign-in token to update the website." });
}
