// POST /api/members/activate { mobile, code, password } — the new member sets
// their own password using the invite code an Admin gave them.
//
// Privacy: a wrong mobile, a wrong code or an already-used code all get the
// same answer ("invalid"), so this can't be used to find out who is a member.
// After 5 wrong codes the invite locks; codes expire after 14 days.
import { getDoc, setFields, deleteDoc, addDoc, serverReady } from "@/lib/server/firestoreRest";
import { findUserByEmail, setPassword, memberEmail, tenDigits } from "@/lib/server/authRest";
import { hashCode, normaliseCode, MAX_ATTEMPTS } from "@/lib/server/invites";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (b, s = 200) => Response.json(b, { status: s });
const INVALID = () => json({ ok: false, reason: "invalid" }, 400);

export async function POST(req) {
  try {
    if (!serverReady()) return json({ ok: false, reason: "server-not-configured" }, 503);
    const { mobile, code, password } = await req.json().catch(() => ({}));
    const m10 = tenDigits(mobile);
    if (m10.length !== 10 || normaliseCode(code).length !== 8) return INVALID();
    if (typeof password !== "string" || password.length < 8 || password.length > 128) return json({ ok: false, reason: "weak-password" }, 400);

    const user = await findUserByEmail(memberEmail(m10));
    if (!user || user.role !== "member") return INVALID();
    const inv = await getDoc(`memberInvites/${user.uid}`);
    if (!inv) return INVALID(); // none issued, or already used
    if ((inv.attempts || 0) >= MAX_ATTEMPTS) return json({ ok: false, reason: "locked" }, 429);
    if (Date.parse(inv.expiresAt) < Date.now()) return json({ ok: false, reason: "expired" }, 400);

    const a = Buffer.from(hashCode(code, user.uid));
    const b = Buffer.from(String(inv.hash || ""));
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      await setFields(`memberInvites/${user.uid}`, { attempts: (inv.attempts || 0) + 1 });
      return INVALID();
    }

    await setPassword(user.uid, password);
    await deleteDoc(`memberInvites/${user.uid}`); // one-time
    const now = new Date();
    const member = await getDoc(`members/${user.uid}`);
    if (member) await setFields(`members/${user.uid}`, { status: "active", activatedAt: now });
    await addDoc("audit", { actorUid: user.uid, actorEmail: "member", action: "Member activated their login", target: `members/${user.uid}`, createdAt: now });
    return json({ ok: true, memberId: member?.memberId || null });
  } catch (e) {
    console.error("activate failed", e);
    return json({ ok: false, reason: "server-error" }, 500);
  }
}
