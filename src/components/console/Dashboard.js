"use client";

import Link from "next/link";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel } from "./ui";
import { applications, submissionQueue, appointments, translationItems, auditLog, canSee } from "@/data/console";
import { useLiveCount, useAdminList, LIVE } from "@/lib/cms";
import Icon from "../Icon";
import { useSession } from "../session";

const when = (iso) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

// LIVE: real numbers from the database (Admins only). Preview: sample figures.
function useAdminCards(isAdmin) {
  const on = (col) => (isAdmin ? col : null);
  const msgs = useLiveCount(on("inbox"), ["status", "new"]);
  const apts = useLiveCount(on("appointments"), ["status", "new"]);
  const apps = useLiveCount(on("applications"), ["status", "pending_payment"]);
  const subs = useLiveCount(on("submissions"), ["status", "pending"]);
  const show = (n) => (n == null ? "…" : n);
  return [
    { href: "/console/inbox", icon: "mail", n: show(msgs), label: "new messages" },
    { href: "/console/review", icon: "check", n: show(subs), label: "contributor submissions to review" },
    { href: "/console/appointments", icon: "calendar", n: show(apts), label: "appointment requests" },
    { href: "/console/members", icon: "lock", n: show(apps), label: "new member registrations" },
  ];
}

// A contributor's own submissions (the database only lets them count their own).
function useContributorCards(uid) {
  const on = uid ? "submissions" : null;
  const waiting = useLiveCount(on, ["authorUid", uid], ["status", "pending"]);
  const published = useLiveCount(on, ["authorUid", uid], ["status", "accepted"]);
  const changes = useLiveCount(on, ["authorUid", uid], ["status", "changes"]);
  const show = (n) => (n == null ? "…" : n);
  return [
    { href: "/console/mine", icon: "clock", n: show(waiting), label: "waiting for review" },
    { href: "/console/mine", icon: "check", n: show(published), label: "published" },
    { href: "/console/mine", icon: "pen", n: show(changes), label: "need changes" },
  ];
}

function sampleAdminCards() {
  const needsReview = translationItems.reduce((n, x) => n + (x.bn !== "reviewed") + (x.hi !== "reviewed"), 0);
  return [
    { href: "/console/inbox", icon: "mail", n: 3, label: "new messages" },
    { href: "/console/review", icon: "check", n: submissionQueue.filter((s) => s.status === "review").length, label: "contributor submissions to review" },
    { href: "/console/appointments", icon: "calendar", n: appointments.filter((a) => a.status === "new").length, label: "appointment requests" },
    { href: "/console/members", icon: "lock", n: applications.filter((a) => a.status === "new").length, label: "new member registrations" },
    { href: "/console/translations", icon: "globe", n: needsReview, label: "translations to review" },
  ];
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

export default function Dashboard() {
  const { role, me } = useRole();
  const mine = submissionQueue.filter((s) => s.by === me.email);
  const session = useSession();
  const liveAdmin = useAdminCards(LIVE && role === "admin");
  const liveContrib = useContributorCards(LIVE && role === "contributor" ? session?.uid : null);

  const cards = (role === "contributor"
    ? LIVE ? liveContrib : [
        { href: "/console/mine", icon: "clock", n: mine.filter((s) => s.status === "review").length, label: "waiting for review" },
        { href: "/console/mine", icon: "check", n: mine.filter((s) => s.status === "approved").length, label: "published" },
        { href: "/console/mine", icon: "pen", n: mine.filter((s) => s.status === "changes").length, label: "need changes" },
      ]
    : LIVE ? liveAdmin : sampleAdminCards()
  ).filter((c) => canSee(role, c.href));

  const actions = (role === "contributor"
    ? [
        { href: "/console/mine?new=article", label: "Add article / news" },
        { href: "/console/mine?new=petition", label: "Add petition" },
        { href: "/console/mine?new=campaign", label: "Add campaign" },
      ]
    : [
        { href: "/console/inbox", label: "Read messages" },
        { href: "/console/edit", label: "Edit a page" },
        { href: "/console/review", label: "Review submissions" },
        { href: "/console/campaigns", label: "Start a petition or campaign" },
        { href: "/console/content", label: "Update the leadership team" },
        { href: "/console/landing", label: "Edit the landing page" },
        { href: "/console/statements", label: "Issue an official statement" },
        { href: "/console/team", label: "Add a contributor" },
      ]
  ).filter((a) => canSee(role, a.href.split("?")[0]));

  return (
    <>
      <PageTitle title={`Namaskar, ${me.label}`} sub={role === "contributor" ? "Write, create and submit — an Admin reviews everything. Until it is accepted, only Admins can see it." : "Here's what needs your attention today."} />
      <div className="cs-cards">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="cs-stat">
            <i aria-hidden="true"><Icon name={c.icon} size={22} /></i>
            <b>{c.n}</b>
            <span>{c.label}</span>
          </Link>
        ))}
      </div>
      <div className="cs-two">
        <Panel title="Quick actions">
          <div className="cs-actions">
            {actions.map((a) => <Link key={a.label} href={a.href} className="btn btn-ghost">{a.label}</Link>)}
          </div>
        </Panel>
        {canSee(role, "/console/audit") ? (
          <Activity />
        ) : (
          <Panel title="How it works">
            <ol className="cs-steps">
              <li>Write an article or blog, or create a petition / campaign.</li>
              <li>Press <b>Submit for review</b>.</li>
              <li>An Admin accepts it (it goes live on the website) or sends it back with a note. Until then only Admins can see it.</li>
              <li>Track everything under <Link href="/console/mine" className="link-arrow">My submissions</Link>.</li>
            </ol>
          </Panel>
        )}
      </div>
    </>
  );
}
