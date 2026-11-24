"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { t, fill } from "@/i18n/config";
import { findGroup } from "@/data/placeholder";
import { Done, DistrictSelect } from "./Forms";
import Icon from "./Icon";

// ---------------------------------------------------------------------
// DEMO FORMS for the info pages — nothing is sent or saved yet.
// Phase 2: each topic emails its inbox + creates a ticket in the console.
// ---------------------------------------------------------------------

const EventsMap = dynamic(() => import("./EventsMap"), { ssr: false });
const ticket = () => `WB-${Math.floor(100000 + Math.random() * 900000)}`;

/** Big tappable tiles to choose a topic (radio buttons underneath). */
function TopicTiles({ name, topics, lang, value, onChange }) {
  return (
    <div className="topics" role="radiogroup">
      {topics.map((tp) => (
        <label key={tp.id} className={`topic${value === tp.id ? " on" : ""}`}>
          <input type="radio" name={name} value={tp.id} checked={value === tp.id} onChange={() => onChange(tp.id)} required />
          
          <span>{t(tp.t, lang)}</span>
        </label>
      ))}
    </div>
  );
}

export function ContactForm({ lang, topics, s, c }) {
  const [topic, setTopic] = useState("feedback");
  const [done, setDone] = useState(null);
  const current = topics.find((x) => x.id === topic);
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(ticket()); }}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.topic}</legend>
        <TopicTiles name="topic" topics={topics} lang={lang} value={topic} onChange={setTopic} />
      </fieldset>
      {current && <p className="route"><Icon name="mail" size={15} /> {fill(s.goesTo, { email: current.inbox })}</p>}
      <div className="field"><label htmlFor="cname">{s.name}</label><input id="cname" autoComplete="name" /></div>
      <div className="field"><label htmlFor="creply">{s.reply}</label><input id="creply" /></div>
      <DistrictSelect lang={lang} label={s.district} name="cdistrict" />
      <div className="field"><label htmlFor="cmsg">{s.message}</label><textarea id="cmsg" required /></div>
      <label className="check"><input type="checkbox" /> {s.anon}</label>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

export function HelpRequestForm({ lang, topics, s, c }) {
  const [topic, setTopic] = useState("");
  const [done, setDone] = useState(null);
  const current = topics.find((x) => x.id === topic);
  const team = current?.group ? t(findGroup(current.group).name, lang) : s.desk;
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(ticket()); }}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.pick}</legend>
        <TopicTiles name="htopic" topics={topics} lang={lang} value={topic} onChange={setTopic} />
      </fieldset>
      {current && <p className="route">➜ {fill(s.goesTo, { team })}</p>}
      <div className="field"><label htmlFor="hdesc">{s.describe}</label><textarea id="hdesc" required /></div>
      <DistrictSelect lang={lang} label={s.district} name="hdistrict" />
      <div className="field"><label htmlFor="hreply">{s.reply}</label><input id="hreply" /></div>
      <label className="check"><input type="checkbox" /> {s.anon}</label>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

export function VolunteerForm({ lang, skills, slots, s, c }) {
  const [done, setDone] = useState(false);
  if (done) return <div className="card"><Done text={s.thanks} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.skills}</legend>
        <div className="checks" style={{ marginTop: 6 }}>
          {skills.map((k) => <label key={k.id}><input type="checkbox" name="skills" value={k.id} /> {t(k.t, lang)}</label>)}
        </div>
      </fieldset>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.when}</legend>
        <div className="checks" style={{ marginTop: 6 }}>
          {slots.map((k) => <label key={k.id}><input type="checkbox" name="when" value={k.id} /> {t(k.t, lang)}</label>)}
        </div>
      </fieldset>
      <div className="field"><label htmlFor="vname">{s.name}</label><input id="vname" required autoComplete="name" /></div>
      <div className="field"><label htmlFor="vphone">{s.phone}</label><input id="vphone" type="tel" required autoComplete="tel" /></div>
      <DistrictSelect lang={lang} label={s.district} name="vdistrict" />
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

export function PetitionRequestForm({ lang, s, c }) {
  const [kind, setKind] = useState("online");
  const [done, setDone] = useState(false);
  if (done) return <div className="card"><Done text={s.thanks} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <div className="field"><label htmlFor="rt">{s.titleField}</label><input id="rt" required maxLength={120} /></div>
      <div className="field"><label htmlFor="rp">{s.problem}</label><textarea id="rp" required /></div>
      <div className="field"><label htmlFor="ra">{s.authority}</label><input id="ra" /></div>
      <DistrictSelect lang={lang} label={s.district} name="rdistrict" />
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{s.type}</legend>
        <div className="checks" style={{ marginTop: 6 }}>
          <label><input type="radio" name="rkind" checked={kind === "online"} onChange={() => setKind("online")} /> {s.typeOnline}</label>
          <label><input type="radio" name="rkind" checked={kind === "formal"} onChange={() => setKind("formal")} /> {s.typeFormal}</label>
        </div>
      </fieldset>
      <div className="field"><label htmlFor="re">{s.evidence}</label><input id="re" type="url" placeholder="https://" /></div>
      <div className="field"><label htmlFor="rr">{s.reply}</label><input id="rr" required /></div>
      <button className="btn btn-saffron" type="submit">{s.submit}</button>
      <p className="form-note">{c.demoNote}</p>
    </form>
  );
}

export function CopyText({ text, label, done }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-sm btn-ghost"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); } catch {} }}
    >
      {ok ? done : label}
    </button>
  );
}

export function OfficeMap({ lat, lng, offices, lang, labels }) {
  return (
    <div className="detail-map">
      <EventsMap events={[]} offices={offices} lang={lang} labels={labels} focus={[[lat, lng]]} single />
    </div>
  );
}
