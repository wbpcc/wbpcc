"use client";

import { useEffect, useState } from "react";
import { t, fill, formatNumber, intlLocale } from "@/i18n/config";
import { districts, findGroup } from "@/data/placeholder";
import { demoMember } from "@/data/portal";
import { useSession, loadFirebase, LIVE } from "./session";
import Icon from "./Icon";

// The signed-in member's own record (members/{uid}). The database lets a
// member read only their own — never anyone else's.
const DEMO = { memberId: demoMember.id, district: demoMember.district, group: demoMember.group, since: demoMember.since };

export function useMyMember() {
  const s = useSession();
  const [m, setM] = useState(LIVE ? undefined : DEMO); // undefined = loading, null = none
  useEffect(() => {
    if (!LIVE || !s) return;
    let alive = true;
    (async () => {
      try {
        const [{ db }, f] = await Promise.all([loadFirebase(), import("firebase/firestore")]);
        const snap = await f.getDoc(f.doc(db, "members", s.uid));
        if (!alive) return;
        const d = snap.exists() ? snap.data() : null;
        setM(d ? { ...d, since: d.since?.toDate ? d.since.toDate().toISOString() : d.since } : null);
      } catch {
        if (alive) setM(null);
      }
    })();
    return () => { alive = false; };
  }, [s]);
  return m;
}

const daysSince = (iso) => (iso ? Math.max(1, Math.floor((Date.now() - Date.parse(iso)) / 86400000) + 1) : 1);

/** Portal header: "WB-NAD-MAH-1234 · Nadia · Mahila Congress". */
export function MemberIdLine({ lang }) {
  const m = useMyMember();
  if (m === undefined) return <p className="id-line">…</p>;
  if (!m) return <p className="id-line">—</p>;
  const g = m.group ? findGroup(m.group) : null;
  return (
    <p className="id-line">
      <code>{m.memberId}</code>
      {m.district && <> · {t(districts[m.district], lang)}</>}
      {g && <> · {t(g.name, lang)}</>}
    </p>
  );
}

/** Portal header: "Day N of your first 60". */
export function MemberTier({ lang, p }) {
  const m = useMyMember();
  const day = m ? daysSince(m.since) : 1;
  const pct = Math.min(100, Math.round((day / 60) * 100));
  return (
    <div className="tier">
      <small>{fill(p.tier, { n: formatNumber(Math.min(day, 60), lang) })}</small>
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <small><Icon name="lock" size={14} /> {p.private}</small>
    </div>
  );
}

/** Profile page: Member ID, district, organisation, since. */
export function ProfileFacts({ lang, s }) {
  const m = useMyMember();
  if (m === undefined) return <div className="card"><p className="cs-muted">…</p></div>;
  const g = m?.group ? findGroup(m.group) : null;
  const since = m?.since ? new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "long", year: "numeric" }).format(new Date(m.since)) : "—";
  const rows = [
    ["id", s.memberId, m?.memberId ? <code key="id">{m.memberId}</code> : "—"],
    ["pin", s.district, m?.district ? t(districts[m.district], lang) : "—"],
    ["users", s.group, g ? t(g.name, lang) : "—"],
    ["star", s.tier, s.tierNew],
    ["calendar", s.since, since],
  ];
  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      {rows.map(([icon, label, value]) => (
        <div key={label} className="fact"><i><Icon name={icon} /></i><div><b>{label}</b><span>{value}</span></div></div>
      ))}
    </div>
  );
}
