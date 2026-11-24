"use client";

import { useEffect, useState } from "react";
import { t, fill, formatNumber, intlLocale } from "@/i18n/config";
import Link from "next/link";
import { districts, findGroup, events } from "@/data/placeholder";
import { demoMember, announcements as SAMPLE_ANNOUNCEMENTS } from "@/data/portal";
import { useSession, loadFirebase, LIVE } from "./session";
import { withTimes, useNow } from "./useEventTimes";
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

const EMPTY = {
  en: { ann: "No announcements yet.", events: "No upcoming events right now.", state: "Nothing scheduled in your district yet — events across the state:" },
  bn: { ann: "এখনও কোনো ঘোষণা নেই।", events: "এই মুহূর্তে কোনো আসন্ন অনুষ্ঠান নেই।", state: "আপনার জেলায় এখনও কিছু নির্ধারিত হয়নি — রাজ্যজুড়ে অনুষ্ঠান:" },
  hi: { ann: "अभी कोई घोषणा नहीं है।", events: "अभी कोई आगामी कार्यक्रम नहीं है।", state: "आपके ज़िले में अभी कुछ तय नहीं — पूरे राज्य के कार्यक्रम:" },
};
const shortDate = (iso, lang) => (iso ? new Intl.DateTimeFormat(intlLocale[lang], { day: "numeric", month: "short" }).format(new Date(iso)) : "");

/**
 * Members-area announcements (Console → Leadership & organisation → Announcements).
 * Members-only — read from the database after sign-in, never part of the public site.
 */
export function MemberAnnouncements({ lang }) {
  const s = useSession();
  const [list, setList] = useState(LIVE ? undefined : SAMPLE_ANNOUNCEMENTS);
  useEffect(() => {
    if (!LIVE || !s) return;
    let alive = true;
    (async () => {
      try {
        const [{ db }, f] = await Promise.all([loadFirebase(), import("firebase/firestore")]);
        const snap = await f.getDocs(f.query(f.collection(db, "resources"), f.where("kind", "==", "announcement")));
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          .filter((a) => a.status !== "draft")
          .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
        if (alive) setList(items);
      } catch {
        if (alive) setList([]);
      }
    })();
    return () => { alive = false; };
  }, [s]);
  if (list === undefined) return <p className="cs-muted">…</p>;
  if (!list.length) return <p className="form-note">{(EMPTY[lang] || EMPTY.en).ann}</p>;
  return (
    <div className="announce-list">
      {list.map((a) => (
        <article key={a.id} className="card announce">
          <small><b>{t(a.from, lang)}</b>{a.date ? ` · ${shortDate(a.date, lang)}` : ""}</small>
          <p>{t(a.text, lang)}</p>
        </article>
      ))}
    </div>
  );
}

/** Upcoming events in the member's own district (else the next ones across the state). */
export function MemberUpcoming({ lang }) {
  const m = useMyMember();
  const now = useNow();
  if (!now || m === undefined) return <p className="cs-muted">…</p>;
  const upcoming = events.map((e) => withTimes(e, now)).filter((e) => e.status !== "past").sort((a, b) => a.start - b.start);
  const mine = m?.district ? upcoming.filter((e) => e.district === m.district) : [];
  const list = (mine.length ? mine : upcoming).slice(0, 4);
  const tx = EMPTY[lang] || EMPTY.en;
  if (!list.length) return <p className="form-note">{tx.events}</p>;
  return (
    <div className="announce-list">
      {!mine.length && m?.district && <p className="form-note">{tx.state}</p>}
      {list.map((e) => (
        <Link key={e.id} href={`/${lang}/events/${e.id}`} className="card card-link announce">
          <b>{t(e.title, lang)}</b>
          <small><Icon name="calendar" size={14} /> {shortDate(new Date(e.start).toISOString(), lang)} · <Icon name="pin" size={14} /> {t(e.place, lang)}</small>
        </Link>
      ))}
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
