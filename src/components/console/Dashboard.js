"use client";

import Link from "next/link";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel } from "./ui";
import { applications, submissionQueue, appointments, auditLog, canSee } from "@/data/console";
import { useLiveCount, useAdminList, LIVE } from "@/lib/cms";
import Icon from "../Icon";
import { useSession } from "../session";

// Compact dashboard: small option tiles (2×2 on phones) and a status strip whose
// boxes open the matching list. Numbers are real on the live site.
const when = (iso) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
const show = (n) => (n == null ? "…" : n);

function Tiles({ items }) {
  return (
    <div className="cs-tiles">
      {items.map((x) => (
        <Link key={x.href + x.label} href={x.href} className="cs-tile">
          <i aria-hidden="true"><Icon name={x.icon} size={22} /></i>
          <span>{x.label}</span>
        </Link>
      ))}
    </div>
  );
}

function Statuses({ title, items }) {
  return (
    <section className="cs-statusbar" aria-label={title}>
      <h2>{title}</h2>
      <div className="cs-status-grid">
        {items.map((x) => (
          <Link key={x.label} href={x.href} className={`cs-status${x.alert && x.n > 0 ? " is-alert" : ""}`}>
            <b>{x.n}</b>
            <span>{x.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- Contributor ----------------------------- */
function useContributorCounts(uid) {
  const on = LIVE && uid ? "submissions" : null;
  const pending = useLiveCount(on, ["authorUid", uid], ["status", "pending"]);
  const changes = useLiveCount(on, ["authorUid", uid], ["status", "changes"]);
  const accepted = useLiveCount(on, ["authorUid", uid], ["status", "accepted"]);
  const drafts = useLiveCount(on, ["authorUid", uid], ["status", "draft"]);
  if (!LIVE) {
    const mine = submissionQueue.filter((s) => s.by === "contributor1@wbpcc.org");
    const c = (st) => mine.filter((s) => s.status === st).length;
    return { pending: c("review"), changes: c("changes"), accepted: c("approved"), drafts: 0 };
  }
  return { pending: show(pending), changes: show(changes), accepted: show(accepted), drafts: show(drafts) };
}

function ContributorDashboard() {
  const session = useSession();
  const c = useContributorCounts(session?.uid);
  return (
    <>
      <PageTitle title="Namaskar" sub="Write it, submit it — an Admin reviews everything before it goes live." />
      <Tiles items={[
        { href: "/console/mine?new=article", icon: "doc", label: "Add article" },
        { href: "/console/mine?new=petition", icon: "pen", label: "Add petition" },
        { href: "/console/mine?new=campaign", icon: "flag", label: "Add campaign" },
        { href: "/console/mine?edit=1", icon: "list", label: "Request an edit" },
      ]} />
      <Statuses title="My submissions" items={[
        { href: "/console/mine?status=pending", n: c.pending, label: "Waiting for review" },
        { href: "/console/mine?status=changes", n: c.changes, label: "Need changes", alert: true },
        { href: "/console/mine?status=accepted", n: c.accepted, label: "Published" },
        { href: "/console/mine?status=draft", n: c.drafts, label: "Drafts" },
      ]} />
    </>
  );
}

/* -------------------------------- Admin -------------------------------- */
function useAdminCounts() {
  const on = (col) => (LIVE ? col : null);
  const msgs = useLiveCount(on("inbox"), ["status", "new"]);
  const subs = useLiveCount(on("submissions"), ["status", "pending"]);
  const apts = useLiveCount(on("appointments"), ["status", "new"]);
  const apps = useLiveCount(on("applications"), ["status", "pending_payment"]);
  if (!LIVE) {
    return {
      msgs: 3, subs: submissionQueue.filter((s) => s.status === "review").length,
      apts: appointments.filter((a) => a.status === "new").length, apps: applications.filter((a) => a.status === "new").length,
    };
  }
  return { msgs: show(msgs), subs: show(subs), apts: show(apts), apps: show(apps) };
}

function Activity() {
  const [live, , state] = useAdminList("audit", [], 6);
  const rows = LIVE
    ? live.map((e) => ({ at: e.createdAt ? when(e.createdAt) : "", who: e.actorEmail, action: e.action, target: e.target }))
    : auditLog.slice(0, 5);
  return (
    <Panel title="Recent activity" actions={<Link href="/console/audit" className="link-arrow">Full log →</Link>}>
      {LIVE && state === "loading" && <p className="cs-muted">Loading…</p>}
      <ul className="cs-feed">
        {rows.map((e, i) => (
          <li key={i}><small>{e.at}</small><span><b>{e.who}</b> {String(e.action || "").toLowerCase()} — {e.target}</span></li>
        ))}
        {LIVE && state === "ready" && rows.length === 0 && <li className="cs-muted">Nothing yet.</li>}
      </ul>
    </Panel>
  );
}

function AdminDashboard({ role }) {
  const c = useAdminCounts();
  return (
    <>
      <PageTitle title="Namaskar" sub="Here's what needs your attention." />
      <Statuses title="Waiting for you" items={[
        { href: "/console/inbox", n: c.msgs, label: "New messages", alert: true },
        { href: "/console/review", n: c.subs, label: "Submissions to review", alert: true },
        { href: "/console/appointments", n: c.apts, label: "Appointment requests", alert: true },
        { href: "/console/members", n: c.apps, label: "New registrations", alert: true },
      ].filter((x) => canSee(role, x.href))} />
      <Tiles items={[
        { href: "/console/edit", icon: "pen", label: "Edit a page" },
        { href: "/console/landing", icon: "layout", label: "Landing page" },
        { href: "/console/content", icon: "landmark", label: "Leadership & organisation" },
        { href: "/console/campaigns", icon: "flag", label: "Petitions & campaigns" },
        { href: "/console/posts", icon: "megaphone", label: "News" },
        { href: "/console/content?tab=events", icon: "calendar", label: "Events" },
        { href: "/console/content?tab=notices", icon: "users", label: "Members' announcements" },
        { href: "/en", icon: "home", label: "View website" },
      ].filter((x) => x.href.startsWith("/en") || canSee(role, x.href.split("?")[0]))} />
      {canSee(role, "/console/audit") && <Activity />}
    </>
  );
}

export default function Dashboard() {
  const { role } = useRole();
  return role === "contributor" ? <ContributorDashboard /> : <AdminDashboard role={role} />;
}
