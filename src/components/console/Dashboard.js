"use client";

import Link from "next/link";
import { useRole } from "./ConsoleShell";
import { PageTitle, Panel } from "./ui";
import { applications, submissionQueue, appointments, translationItems, auditLog, canSee } from "@/data/console";
import Icon from "../Icon";

export default function Dashboard() {
  const { role, me } = useRole();
  const mine = submissionQueue.filter((s) => s.by === me.email);
  const needsReview = translationItems.reduce((n, x) => n + (x.bn !== "reviewed") + (x.hi !== "reviewed"), 0);

  const cards = (role === "contributor"
    ? [
        { href: "/console/mine", icon: "clock", n: mine.filter((s) => s.status === "review").length, label: "waiting for review" },
        { href: "/console/mine", icon: "check", n: mine.filter((s) => s.status === "approved").length, label: "published" },
        { href: "/console/mine", icon: "pen", n: mine.filter((s) => s.status === "changes").length, label: "need changes" },
      ]
    : [
        { href: "/console/review", icon: "check", n: submissionQueue.filter((s) => s.status === "review").length, label: "contributor submissions to review" },
        { href: "/console/appointments", icon: "calendar", n: appointments.filter((a) => a.status === "new").length, label: "appointment requests" },
        { href: "/console/members", icon: "lock", n: applications.filter((a) => a.status === "new").length, label: "new member registrations" },
        { href: "/console/translations", icon: "globe", n: needsReview, label: "translations to review" },
      ]
  ).filter((c) => canSee(role, c.href));

  const actions = (role === "contributor"
    ? [
        { href: "/console/mine?new=article", label: "Add article / news" },
        { href: "/console/mine?new=petition", label: "Add petition" },
        { href: "/console/mine?new=campaign", label: "Add campaign" },
      ]
    : [
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
          <Panel title="Recent activity" actions={<Link href="/console/audit" className="link-arrow">Full log →</Link>}>
            <ul className="cs-feed">
              {auditLog.slice(0, 5).map((e, i) => (
                <li key={i}><small>{e.at}</small><span><b>{e.who}</b> {e.action.toLowerCase()} — {e.target}</span></li>
              ))}
            </ul>
          </Panel>
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
