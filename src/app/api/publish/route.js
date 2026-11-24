// POST /api/publish — an Admin saved something in the console; rebuild the
// public website so it shows the new content (Vercel deploy hook).
// Only a signed-in Admin can trigger it: the browser sends its Firebase ID
// token and we check the "admin" role on it here, on the server.
import { FieldValue } from "firebase-admin/firestore";
import { admin, adminReady } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status });

export async function POST(req) {
  if (!adminReady) return json({ ok: false, rebuilding: false, reason: "server-not-configured" }, 503);

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ ok: false, reason: "signed-out" }, 401);

  const { auth, db } = admin();
  let user;
  try { user = await auth.verifyIdToken(token); }
  catch { return json({ ok: false, reason: "bad-token" }, 401); }
  if (user.role !== "admin") return json({ ok: false, reason: "not-admin" }, 403);

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) return json({ ok: true, rebuilding: false, reason: "no-deploy-hook" });

  let ok = false;
  try { ok = (await fetch(hook, { method: "POST" })).ok; } catch {}
  await db.collection("audit").add({
    actorUid: user.uid, actorEmail: user.email || "", action: ok ? "Started website update" : "Website update failed to start",
    target: "website", createdAt: FieldValue.serverTimestamp(),
  });
  return json({ ok, rebuilding: ok });
}
