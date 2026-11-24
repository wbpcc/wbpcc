// POST /api/members/approve { applicationId, verifiedBy } — Admin only.
// Creates the member's login (their mobile number), gives it the "member"
// role and a Member ID, and returns a one-time invite code for the Admin to
// pass on (WhatsApp / SMS / call). The member then sets their own password on
// /activate — nobody else ever sees it.
import { getDoc, writeDoc, setFields, addDoc, serverReady } from "@/lib/server/firestoreRest";
import { requireAdmin, createUser, findUserByEmail, setRole, memberEmail, tenDigits } from "@/lib/server/authRest";
import { newInviteCode, inviteRecord, newMemberId, INVITE_DAYS } from "@/lib/server/invites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (b, s = 200) => Response.json(b, { status: s });

export async function POST(req) {
  try {
    if (!serverReady()) return json({ ok: false, reason: "server-not-configured" }, 503);
    const { user, error } = await requireAdmin(req);
    if (error) return error;

    const { applicationId, verifiedBy } = await req.json().catch(() => ({}));
    if (!/^[A-Za-z0-9_-]{6,60}$/.test(String(applicationId || ""))) return json({ ok: false, reason: "bad-request" }, 400);
    const app = await getDoc(`applications/${applicationId}`);
    if (!app) return json({ ok: false, reason: "not-found" }, 404);
    if (app.status === "approved" && app.memberUid) return json({ ok: false, reason: "already-approved" }, 409);
    if (app.status === "rejected") return json({ ok: false, reason: "rejected" }, 409);

    const mobile = tenDigits(app.mobile);
    if (mobile.length !== 10) return json({ ok: false, reason: "bad-mobile" }, 422);
    const email = memberEmail(mobile);

    // One login per mobile number.
    const existing = await findUserByEmail(email);
    if (existing) return json({ ok: false, reason: "mobile-already-member" }, 409);
    const uid = await createUser({ email, displayName: app.name });
    await setRole(uid, "member");

    const memberId = newMemberId(app.district, app.group);
    const code = newInviteCode();
    const now = new Date();
    await writeDoc(`members/${uid}`, {
      memberId, name: app.name, mobile, district: app.district || null, group: app.group || null,
      language: app.lang || "en", status: "invited", applicationId, since: now, createdAt: now,
    });
    await writeDoc(`memberInvites/${uid}`, inviteRecord(code, uid, user.email));
    await setFields(`applications/${applicationId}`, {
      status: "approved", memberId, memberUid: uid, verifiedBy: String(verifiedBy || "").slice(0, 500),
      invitedAt: now, handledBy: user.email, handledAt: now,
    });
    await addDoc("audit", {
      actorUid: user.uid, actorEmail: user.email, action: `Approved member & created login (${memberId})`,
      target: `applications/${applicationId}`, createdAt: now,
    });

    return json({ ok: true, memberId, memberUid: uid, mobile, invite: code, validDays: INVITE_DAYS });
  } catch (e) {
    console.error("approve failed", e);
    return json({ ok: false, reason: "server-error", detail: e.code || e.message }, 500);
  }
}
