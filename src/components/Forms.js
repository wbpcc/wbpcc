"use client";

import { useEffect, useState } from "react";
import { t, fill, formatNumber } from "@/i18n/config";
import { districts, groups } from "@/data/placeholder";
import Icon from "./Icon";
import { LIVE } from "@/lib/live";
import { signPetition, liveSignatureCount, fieldsOf, SEND_ERROR, SENDING } from "@/lib/submit";

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
      {!LIVE && <small style={{ color: "var(--muted)" }}>{c.demoNote}</small>}
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

/**
 * Petition: live counter + progress + the sign form (online or formal).
 * LIVE: the signature is saved (Admins only can read it) and the server adds 1
 * to the public count. One signature per petition per device (gentle guard).
 */
const SIGN_TEXT = {
  en: { already: "You've already signed this petition on this device. Thank you!", ref: "Reference" },
  bn: { already: "এই ডিভাইস থেকে আপনি ইতিমধ্যেই এই আবেদনে সই করেছেন। ধন্যবাদ!", ref: "রেফারেন্স" },
  hi: { already: "आप इस डिवाइस से इस याचिका पर पहले ही हस्ताक्षर कर चुके हैं। धन्यवाद!", ref: "संदर्भ" },
};
const signedKey = (id) => `wbpcc-signed-${id}`;

export function PetitionSignBox({ petition, lang, a, p, c }) {
  const [count, setCount] = useState(petition.signatures || 0);
  const [done, setDone] = useState(null);
  const [already, setAlready] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const formal = petition.type === "formal";
  const st = SIGN_TEXT[lang] || SIGN_TEXT.en;
  const pct = Math.min(100, Math.round((count / (petition.goal || 1)) * 100));

  useEffect(() => {
    try { if (localStorage.getItem(signedKey(petition.id))) setAlready(true); } catch {}
    liveSignatureCount(petition.id).then((n) => { if (n != null) setCount(n); });
  }, [petition.id]);

  async function sign(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.website?.value) { setDone("SIG-000000"); return; } // spam trap
    setBusy(true); setErr("");
    try {
      const f = fieldsOf(form, ["name", "contact", "district", "address"]);
      const { ref } = await signPetition(petition.id, {
        ...f,
        showName: !formal && !!form.showName?.checked,
        forGovt: formal,
        lang,
      });
      try { localStorage.setItem(signedKey(petition.id), ref); } catch {}
      setCount((x) => x + 1);
      setDone(ref);
    } catch (e2) {
      console.error(e2);
      setErr(SEND_ERROR[lang] || SEND_ERROR.en);
      setBusy(false);
    }
  }

  return (
    <div className="card form">
      <div>
        <div className="big-count">{formatNumber(count, lang)}</div>
        <div style={{ color: "var(--muted)" }}>{fill(a.goal, { n: formatNumber(petition.goal, lang) })}</div>
        <div className="big-progress"><div className="progress"><span style={{ width: `${pct}%` }} /></div></div>
      </div>
      {done ? (
        <Done text={`${p.thanks} ${st.ref}: ${done}`} c={c} />
      ) : already ? (
        <div className="form-ok" role="status"><div className="tick">✓</div><p>{st.already}</p></div>
      ) : (
        <form className="form" onSubmit={sign}>
          <h2 style={{ fontSize: 22 }}>{p.formTitle}</h2>
          {formal && <p className="form-note">{p.formalNote}</p>}
          <div className="field"><label htmlFor="name">{p.name}</label><input id="name" name="name" required autoComplete="name" maxLength={120} /></div>
          <div className="field"><label htmlFor="contact">{p.contact}</label><input id="contact" name="contact" required maxLength={200} /></div>
          <DistrictSelect lang={lang} label={p.district} />
          {formal && (
            <div className="field"><label htmlFor="address">{p.address}</label><textarea id="address" name="address" required autoComplete="street-address" maxLength={400} style={{ minHeight: 80 }} /></div>
          )}
          {!formal && <label className="check"><input type="checkbox" name="showName" /> {p.showName}</label>}
          <label className="check"><input type="checkbox" required /> {formal ? p.consentFormal : p.consentOnline}</label>
          <div className="hp-field" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {err && <p className="form-note form-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
          <button className="btn btn-saffron" type="submit" disabled={busy}>{busy ? (SENDING[lang] || SENDING.en) : p.submit}</button>
          {!LIVE && <p className="form-note">{c.demoNote}</p>}
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
