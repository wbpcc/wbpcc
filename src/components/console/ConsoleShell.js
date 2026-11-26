"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROLES, NAV, navAllows } from "@/data/console";
import { clearSession, useSession, LIVE } from "../session";
import Icon from "../Icon";

// ---------------------------------------------------------------------
// Team console shell.
//  LIVE: you must be signed in as a Contributor or Admin; your role comes
//        from your login (and the database rules enforce it too).
//  DEMO: the "Viewing as" switcher previews each role; nothing is saved.
// ---------------------------------------------------------------------
const RoleCtx = createContext({ role: "admin", me: ROLES.admin, setRole: () => {} });
export const useRole = () => useContext(RoleCtx);
const KEY = "wbpcc-console-role";

// Screens that already save to the database. The rest show a "not connected yet" note.
const CONNECTED = ["/console/edit", "/console/content", "/console/landing", "/console/pages", "/console/campaigns", "/console/posts", "/console/inbox", "/console/appointments", "/console/members", "/console/review", "/console/mine"];

function matchNav(pathname) {
  const items = NAV.filter((n) => n.href);
  return items.filter((n) => pathname === n.href || pathname.startsWith(n.href + "/")).sort((a, b) => b.href.length - a.href.length)[0];
}

export default function ConsoleShell({ children }) {
  const [demoRole, setRoleState] = useState("admin");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (LIVE) return;
    try { const r = localStorage.getItem(KEY); if (r && ROLES[r]) setRoleState(r); else localStorage.removeItem(KEY); } catch {}
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  // LIVE: signed out (or a member login) → back to the sign-in page.
  const staff = session && session.role === "team";
  useEffect(() => {
    if (LIVE && session !== undefined && !staff) router.replace("/en/signin");
  }, [session, staff, router]);

  if (LIVE && !staff) {
    return (
      <div className="cs-gate">
        <img src="/brand/logo.svg" alt="" width={56} height={56} />
        <p>{session === undefined ? "Checking your sign-in…" : "Please sign in as a Contributor or Admin…"}</p>
      </div>
    );
  }

  const role = LIVE ? session.level : demoRole;
  const setRole = (r) => { setRoleState(r); try { localStorage.setItem(KEY, r); } catch {} };
  const me = LIVE ? { ...ROLES[role], email: session.email } : ROLES[role];
  const connected = pathname === "/console" || CONNECTED.some((h) => pathname === h || pathname.startsWith(h + "/"));
  const current = matchNav(pathname);
  const allowed = !current || navAllows(current, role);

  // Build nav with group headings that only show if they have a visible item.
  const visible = [];
  let pendingGroup = null;
  for (const n of NAV) {
    if (n.group) { pendingGroup = n.group; continue; }
    if (!navAllows(n, role)) continue;
    if (pendingGroup) { visible.push({ group: pendingGroup }); pendingGroup = null; }
    visible.push(n);
  }

  return (
    <RoleCtx.Provider value={{ role, me, setRole }}>
      <div className="cs">
        {open && <div className="cs-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
        <aside className={`cs-side${open ? " open" : ""}`}>
          <div className="cs-side-top">
            <Link href="/console" className="cs-brand">
              <img src="/brand/logo.svg" alt="" width={40} height={40} />
              <span><b>WBPCC</b><small>Team console</small></span>
            </Link>
            <button type="button" className="cs-side-close" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
          </div>
          <nav className="cs-nav" aria-label="Console">
            {visible.map((n, i) =>
              n.group ? (
                <p key={`g${i}`} className="cs-group">{n.group}</p>
              ) : (
                <Link key={n.href} href={n.href} aria-current={current?.href === n.href ? "page" : undefined}>
                  <i aria-hidden="true"><Icon name={n.icon} size={18} /></i>{n.label}
                </Link>
              )
            )}
          </nav>
          <div className="cs-side-foot">
            <Link href="/en">View website ↗</Link>
            <button type="button" onClick={async () => { await clearSession(); router.push("/en"); }}><Icon name="logout" size={16} /> Sign out</button>
          </div>
        </aside>

        <div className="cs-main">
          <header className="cs-top">
            <button type="button" className="cs-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu"><Icon name="menu" size={20} /></button>
            {LIVE ? (
              <>
                <span className="cs-live">● Live</span>
                <span className="cs-who" title={me.email}><Icon name={me.icon} size={15} /> {me.label}<span className="cs-who-email"> · {me.email}</span></span>
                <button type="button" className="cs-signout" onClick={async () => { await clearSession(); router.push("/en"); }}>
                  <Icon name="logout" size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <span className="cs-demo">Preview — nothing is saved</span>
                <label className="cs-role">
                  <span>Viewing as</span>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                  </select>
                </label>
                <span className="cs-me" title="2-step verification on"><Icon name="lock" size={14} /> {me.email}</span>
              </>
            )}
          </header>
          <main className="cs-content">
            {LIVE && allowed && !connected && (
              <p className="cs-warn small cs-not-yet">This screen isn&apos;t connected to the database yet — changes here are <b>not saved</b>. Connected so far: <Link href="/console/inbox">Inbox</Link>, <Link href="/console/review">Review queue</Link>,<Link href="/console/appointments">Appointments</Link>, <Link href="/console/members">Members list</Link>, <Link href="/console/landing">Landing page</Link>, <Link href="/console/pages">Site pages</Link>, <Link href="/console/content">Leadership &amp; organisation</Link>, <Link href="/console/campaigns">Petitions &amp; campaigns</Link>, <Link href="/console/posts">Newsroom posts</Link>.</p>
            )}
            {allowed ? children : <NoAccess roleLabel={me.label} />}
          </main>
        </div>
      </div>
    </RoleCtx.Provider>
  );
}

export function NoAccess({ roleLabel }) {
  return (
    <div className="cs-panel cs-noaccess">
      <div className="big"><Icon name="lock" size={44} /></div>
      <h2>Not available for {roleLabel}</h2>
      <p>This screen is limited to other roles. In the real console it won&apos;t even appear in your menu — the server blocks it too.</p>
      <Link href="/console" className="btn btn-navy btn-sm">Back to dashboard</Link>
    </div>
  );
}
