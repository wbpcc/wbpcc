// POST /api/members/invite { applicationId } — Admin only.
// A new invite code for an approved member who hasn't activated yet (lost or
// expired code). The old code stops working.
import { getDoc, writeDoc, setFields, addDoc, serverReady } from "@/lib/server/firestoreRest";
import { requireAdmin } from "@/lib/server/authRest";
import { newInviteCode, inviteRecord, INVITE_DAYS } from "@/lib/server/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (b, s = 200) => Response.json(b, { status: s });

export async function POST(req) {
  try {
    if (!serverReady()) return json({ ok: false, reason: "server-not-configured" }, 503);
    const { user, error } = await requireAdmin(req);
    if (error) return error;

    const { applicationId } = await req.json().catch(() => ({}));
    if (!/^[A-Za-z0-9_-]{6,60}$/.test(String(applicationId || ""))) return json({ ok: false, reason: "bad-request" }, 400);
    const app = await getDoc(`applications/${applicationId}`);
    if (!app?.memberUid) return json({ ok: false, reason: "not-approved" }, 409);
    const member = await getDoc(`members/${app.memberUid}`);
    if (member?.status === "active") return json({ ok: false, reason: "already-active" }, 409);

    const code = newInviteCode();
    const now = new Date();
    await writeDoc(`memberInvites/${app.memberUid}`, inviteRecord(code, app.memberUid, user.email));
    await setFields(`applications/${applicationId}`, { invitedAt: now, handledBy: user.email, handledAt: now });
    await addDoc("audit", { actorUid: user.uid, actorEmail: user.email, action: "Issued a new member invite code", target: `applications/${applicationId}`, createdAt: now });
    return json({ ok: true, invite: code, memberId: app.memberId, mobile: member?.mobile || "", validDays: INVITE_DAYS });
  } catch (e) {
    console.error("invite failed", e);
    return json({ ok: false, reason: "server-error", detail: e.code || e.message }, 500);
  }
}
