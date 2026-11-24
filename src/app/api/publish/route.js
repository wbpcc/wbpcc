// POST /api/publish — an Admin saved something in the console; rebuild the
// public website so it shows the new content (Vercel deploy hook).
//
// Only a signed-in Admin can trigger it. The browser sends its Firebase ID
// token; we ask Google's sign-in service (Identity Toolkit "accounts:lookup")
// to validate it. Google answers only for a genuine, unexpired token and
// returns that login's custom claims, where the Admin role lives.
// (No firebase-admin here: it doesn't package reliably into Vercel functions.)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status });

async function lookup(token) {
  const key = (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key").trim();
  const emu = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const base = emu ? `http://${emu}/identitytoolkit.googleapis.com` : "https://identitytoolkit.googleapis.com";
  const r = await fetch(`${base}/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error("lookup failed"), { detail: body?.error?.message || `HTTP ${r.status}` });
  const u = body.users?.[0];
  if (!u) throw Object.assign(new Error("no user"), { detail: "USER_NOT_FOUND" });
  let claims = {};
  try { claims = JSON.parse(u.customAttributes || "{}"); } catch {}
  return { uid: u.localId, email: u.email, role: claims.role };
}

export async function POST(req) {
  try {
    const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ ok: false, reason: "signed-out" }, 401);

    let user;
    try { user = await lookup(token); }
    catch (e) { return json({ ok: false, reason: "bad-token", detail: e.detail || e.message }, 401); }
    if (user.role !== "admin") return json({ ok: false, reason: "not-admin" }, 403);

    const hook = (process.env.VERCEL_DEPLOY_HOOK_URL || "").trim();
    if (!hook) return json({ ok: true, rebuilding: false, reason: "no-deploy-hook" });

    let ok = false, detail;
    try { const r = await fetch(hook, { method: "POST", cache: "no-store" }); ok = r.ok; detail = ok ? undefined : `HTTP ${r.status}`; }
    catch (e) { detail = e.message; }
    return json({ ok, rebuilding: ok, reason: ok ? undefined : "hook-failed", detail });
  } catch (e) {
    console.error("publish failed", e);
    return json({ ok: false, rebuilding: false, reason: "server-error", detail: e.code || e.name }, 500);
  }
}

export function GET() {
  return json({ ok: true, info: "POST with an Admin's sign-in token to update the website." });
}
