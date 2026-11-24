"use client";

import { useState } from "react";
import { t, fill, formatNumber } from "@/i18n/config";
import { districts, groups } from "@/data/placeholder";
import Icon from "./Icon";

// ---------------------------------------------------------------------
// DEMO FORMS — nothing is sent or saved yet. In Phase 2:
//  - petition signatures → database, with email/phone OTP to stop fakes
//  - membership applications → the locked "member vault" (leadership only)
//  - group help requests → that group's inbox
// ---------------------------------------------------------------------

export function Done({ text, c }) {
  return (
    <div className="form-ok" role="status">
      <div className="tick">✓</div>
      <p>{text}</p>
      <small style={{ color: "var(--muted)" }}>{c.demoNote}</small>
    </div>
  );
}

export function DistrictSelect({ lang, label, name = "district" }) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} required defaultValue="">
        <option value="" disabled>—</option>
        {Object.entries(districts).map(([id, dn]) => <option key={id} value={id}>{t(dn, lang)}</option>)}
      </select>
    </div>
  );
}

/** Petition: live counter + progress + the sign form (online or formal). */
export function PetitionSignBox({ petition, lang, a, p, c }) {
  const [count, setCount] = useState(petition.signatures);
  const [done, setDone] = useState(false);
  const formal = petition.type === "formal";
  const pct = Math.min(100, Math.round((count / petition.goal) * 100));

  return (
    <div className="card form">
      <div>
        <div className="big-count">{formatNumber(count, lang)}</div>
        <div style={{ color: "var(--muted)" }}>{fill(a.goal, { n: formatNumber(petition.goal, lang) })}</div>
        <div className="big-progress"><div className="progress"><span style={{ width: `${pct}%` }} /></div></div>
      </div>
      {done ? (
        <Done text={p.thanks} c={c} />
      ) : (
        <form className="form" onSubmit={(e) => { e.preventDefault(); setCount((x) => x + 1); setDone(true); }}>
          <h2 style={{ fontSize: 22 }}>{p.formTitle}</h2>
          {formal && <p className="form-note">{p.formalNote}</p>}
          <div className="field"><label htmlFor="name">{p.name}</label><input id="name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="contact">{p.contact}</label><input id="contact" required /></div>
          <DistrictSelect lang={lang} label={p.district} />
          {formal && (
            <div className="field"><label htmlFor="address">{p.address}</label><textarea id="address" required autoComplete="street-address" style={{ minHeight: 80 }} /></div>
          )}
          {!formal && <label className="check"><input type="checkbox" /> {p.showName}</label>}
          <label className="check"><input type="checkbox" required /> {formal ? p.consentFormal : p.consentOnline}</label>
          <button className="btn btn-saffron" type="submit">{p.submit}</button>
          <p className="form-note">{c.demoNote}</p>
        </form>
      )}
    </div>
  );
}

/** Membership application. */
export function JoinForm({ lang, j, c }) {
  const [done, setDone] = useState(false);
  if (done) return <div className="card"><Done text={j.thanks} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); setDone(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      <h2 style={{ fontSize: 24 }}>{j.formTitle}</h2>
      <div className="field"><label htmlFor="jname">{j.name}</label><input id="jname" required autoComplete="name" /></div>
      <div className="field"><label htmlFor="jphone">{j.phone}</label><input id="jphone" type="tel" required autoComplete="tel" /></div>
      <div className="field"><label htmlFor="jemail">{j.email}</label><input id="jemail" type="email" autoComplete="email" /></div>
      <DistrictSelect lang={lang} label={j.district} name="jdistrict" />
      <div className="field"><label htmlFor="jac">{j.constituency}</label><input id="jac" /></div>
      <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend>{j.interests}</legend>
        <div className="checks" style={{ marginTop: 6 }}>
          {groups.map((g) => (
            <label key={g.id}><input type="checkbox" name="groups" value={g.id} /> {t(g.name, lang)}</label>
          ))}
        </div>
      </fieldset>
      <label className="check"><input type="checkbox" required /> {j.consent}</label>
      <button className="btn btn-saffron" type="submit">{j.submit}</button>
      <p className="form-note"><Icon name="lock" size={15} /> {j.privacy}</p>
    </form>
  );
}

/** "Ask this group for help". */
export function HelpForm({ gr, c }) {
  const [done, setDone] = useState(false);
  if (done) return <Done text={gr.sent} c={c} />;
  return (
    <form className="form" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
      <h2 style={{ fontSize: 22 }}>{gr.askTitle}</h2>
      <div className="field"><label htmlFor="msg">{gr.message}</label><textarea id="msg" required /></div>
      <div className="field"><label htmlFor="hc">{gr.yourContact}</label><input id="hc" /></div>
      <button className="btn btn-saffron" type="submit">{gr.send}</button>
    </form>
  );
}
