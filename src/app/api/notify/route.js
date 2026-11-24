// POST /api/notify { col, id } — a public form was just saved; email an alert.
//
// Safe by design:
//  • It only emails for a submission that REALLY exists, was created in the last
//    15 minutes and hasn't been alerted before (then it's marked) — so nobody can
//    use this to spam the party inbox.
//  • The email has NO personal details (no name, phone or message) — those stay
//    in the database, which only Admins can open (Console → Inbox).
//  • Email goes through Resend (an email service whose key can only send mail).
import { getDoc, setFields, serverReady } from "@/lib/server/firestoreRest";
import { getDictionary } from "@/i18n/config";
import { districts } from "@/data/org";

const EN = getDictionary("en");
const districtName = (k) => districts[k]?.en || "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const json = (body, status = 200) => Response.json(body, { status });

const TYPE = {
  feedback: "Feedback", suggestion: "Suggestion", grievance: "Grievance / complaint", help: "Request for help",
  volunteer: "Volunteer", petition: "Petition idea", media: "Media enquiry", other: "Message",
};
const SITE = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://wbpcc.vercel.app").replace(/\/$/, "");

// What the alert says for each kind of submission (never personal details).
const DESCRIBE = {
  inbox: (d) => ({
    subject: `New ${TYPE[d.type] || "message"} on the website`,
    text: `A new "${TYPE[d.type] || "message"}" was sent through the website contact form.\n\nRead it in the console (Admins only):\n${SITE()}/console/inbox\n`,
  }),
  applications: (d) => {
    const where = districtName(d.district);
    return {
      subject: `New membership application${where ? ` (${where})` : ""}`,
      text: `Someone has applied to become a member through the website.${where ? `\nDistrict: ${where}` : ""}\nThe ₹5 fee is not collected online yet.\n\nReview the application in the console (Admins only):\n${SITE()}/console/members\n`,
    };
  },
  // Staff work (not the public): the kind, title and contributor are fine to include.
  submissions: (d) => {
    const kind = { post: "article", petition: "petition", campaign: "campaign" }[d.kind] || "item";
    return {
      subject: `New ${kind} waiting for review`,
      text: `${d.authorEmail || "A contributor"} submitted a ${kind} for review:\n“${d.title?.en || "(untitled)"}”\n\nAccept, ask for changes or reject it in the console:\n${SITE()}/console/review\n`,
    };
  },
  appointments: (d) => {
    const topic = EN.appointment.reasons?.[d.topic] || "General";
    const where = districtName(d.district);
    return {
      subject: `New appointment request${where ? ` (${where})` : ""}`,
      text: `Someone has asked to meet the State President.\n\nTopic: ${topic}\nPreferred date: ${d.date || "—"}${d.time ? `, ${d.time}` : ""}\n${where ? `District: ${where}\n` : ""}\nSee the details and confirm a slot in the console (Admins only):\n${SITE()}/console/appointments\n`,
    };
  },
};

async function sendEmail({ subject, text }) {
  const key = (process.env.RESEND_API_KEY || "").trim();
  if (!key) return { sent: false, reason: "no-email-key" };
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.NOTIFY_FROM || "WBPCC Website <onboarding@resend.dev>",
      to: [(process.env.NOTIFY_EMAIL || "sm.wbpcc@gmail.com").trim()],
      subject: `[WBPCC] ${subject}`,
      text: `${text}\n— Sent automatically by the WBPCC website.`,
    }),
    cache: "no-store",
  });
  if (!r.ok) return { sent: false, reason: "email-failed", detail: (await r.json().catch(() => ({})))?.message || `HTTP ${r.status}` };
  return { sent: true };
}

export async function POST(req) {
  try {
    const { col, id } = await req.json().catch(() => ({}));
    if (!DESCRIBE[col] || !/^[A-Za-z0-9]{10,40}$/.test(String(id || ""))) return json({ sent: false, reason: "bad-request" }, 400);
    if (!serverReady()) return json({ sent: false, reason: "server-not-configured" }, 503);

    const d = await getDoc(`${col}/${id}`);
    if (!d) return json({ sent: false, reason: "not-found" }, 404);
    if (col === "submissions" && d.status !== "pending") return json({ sent: false, reason: "not-submitted" });
    // The moment that matters: when it was sent (or re-submitted, for contributor work).
    const stamp = d.submittedAt || d.createdAt;
    if (d.notifiedAt && Date.parse(d.notifiedAt) >= Date.parse(stamp)) return json({ sent: false, reason: "already-sent" });
    const age = Date.now() - Date.parse(stamp || 0);
    if (!(age >= 0 && age < 15 * 60 * 1000)) return json({ sent: false, reason: "too-old" });

    const res = await sendEmail(DESCRIBE[col](d));
    if (res.sent) await setFields(`${col}/${id}`, { notifiedAt: new Date() });
    return json(res);
  } catch (e) {
    console.error("notify failed", e);
    return json({ sent: false, reason: "server-error" }, 500);
  }
}
