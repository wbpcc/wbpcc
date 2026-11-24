"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t, fill } from "@/i18n/config";
import { groups } from "@/data/placeholder";
import { contactTopics } from "@/data/pages";
import { Done, DistrictSelect } from "./Forms";
import { useSession } from "./session";
import Icon from "./Icon";
import PasswordInput from "./PasswordInput";
import { submitForm, fieldsOf, SEND_ERROR, SENDING, LIVE } from "@/lib/submit";

// ---------------------------------------------------------------------
// The three public forms: Contact · Appointment with the President · Join.
// DEMO — nothing is sent or saved yet. Phase 2: each goes to its inbox /
// the President's office / the membership list, with real OTP checks.
// Appointment mirrors TNCC's form; Join mirrors KPPC's register form,
// both adapted for West Bengal.
// ---------------------------------------------------------------------
const ref = (p) => `${p}-${Math.floor(100000 + Math.random() * 900000)}`;
const today = () => new Date().toISOString().slice(0, 10);

function Section({ n, title, children }) {
  return (
    <fieldset className="form-section">
      <legend><span className="num">{n}</span>{title}</legend>
      <div className="form-grid">{children}</div>
    </fieldset>
  );
}

function F({ label, req, wide, children }) {
  return (
    <div className={`field${wide ? " wide" : ""}`}>
      <label>{label}{req && <span className="req"> *</span>}</label>
      {children}
    </div>
  );
}

/**
 * Mobile number — a plain required box. No OTP (the party's call): anyone can
 * send a form; the office confirms by phone or email while reviewing it.
 */
function MobileField({ label, name = "phone" }) {
  return (
    <div className="field wide">
      <label>{label}<span className="req"> *</span></label>
      <input name={name} type="tel" required inputMode="tel" pattern="[0-9+ ]{10,15}" placeholder="+91" autoComplete="tel" maxLength={15} />
    </div>
  );
}

/* ---------------------------- Contact ---------------------------- */
// Saved to the database (Console → Inbox, Admins only) + an email alert.
// The hidden "website" box is a spam trap: people never see it, bots fill it.
const TYPES = ["feedback", "suggestion", "grievance", "help", "volunteer", "petition", "media", "other"];
export function ContactForm({ lang, s, c }) {
  const [type, setType] = useState("feedback");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("type");
    if (q && contactTopics.find((x) => x.id === q)) setType(q);
  }, []);
  const cur = contactTopics.find((x) => x.id === type);
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.website?.value) { setDone("WB-000000"); return; } // spam trap
    setBusy(true); setErr("");
    try {
      const f = fieldsOf(form, ["name", "email", "phone", "message"]);
      const { ref: r } = await submitForm("inbox", {
        type: TYPES.includes(type) ? type : "other",
        ...f, lang, status: "new",
      }, "WB");
      setDone(r);
    } catch (e2) {
      console.error(e2);
      setErr(SEND_ERROR[lang] || SEND_ERROR.en);
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={send}>
      <F label={s.type} req>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {contactTopics.map((x) => <option key={x.id} value={x.id}>{t(x.t, lang)}</option>)}
        </select>
        {!LIVE && <small className="route"><Icon name="mail" size={15} /> {fill(s.goesTo, { email: cur.inbox })}</small>}
      </F>
      <F label={s.name}><input name="name" autoComplete="name" maxLength={120} /></F>
      <F label={s.email} req><input name="email" type="email" required autoComplete="email" maxLength={200} /></F>
      <F label={s.phone}><input name="phone" type="tel" autoComplete="tel" maxLength={20} /></F>
      <F label={s.message} req><textarea name="message" required rows={6} maxLength={5000} /></F>
      <div className="hp-field" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {err && <p className="form-note form-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
      <button className="btn btn-saffron" type="submit" disabled={busy}>{busy ? (SENDING[lang] || SENDING.en) : s.submit}</button>
      {!LIVE && <p className="form-note">{c.demoNote}</p>}
    </form>
  );
}

/* --------------------- Appointment with the President --------------------- */
export function AppointmentForm({ lang, s, g, c, requireMember = false }) {
  const session = useSession();
  const [who, setWho] = useState("worker");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (requireMember && session !== undefined && session?.role !== "member") {
    return (
      <div className="card members-only">
        <span className="big" aria-hidden="true"><Icon name="id" size={40} /></span>
        <p>{s.membersOnly}</p>
        <div className="cs-row" style={{ justifyContent: "center" }}>
          <Link href={`/${lang}/signin`} className="btn btn-saffron">{s.signin}</Link>
          <Link href={`/${lang}/join`} className="btn btn-outline">{s.join}</Link>
        </div>
      </div>
    );
  }
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.website?.value) { setDone("APT-000000"); return; } // spam trap
    setBusy(true); setErr("");
    try {
      const f = fieldsOf(form, ["name", "guardian", "gender", "dob", "occupation", "phone", "email", "whatsapp",
        "district", "pin", "date", "time", "altDate", "altTime", "mode", "duration", "topic", "reason", "more"]);
      const address = fieldsOf(form, ["door", "street", "town"]);
      const specify = fieldsOf(form, ["specify"]).specify;
      const people = parseInt(new FormData(form).get("people"), 10);
      const { ref: r } = await submitForm("appointments", {
        ...f,
        address: [address.door, address.street, address.town].filter(Boolean).join(", ") || undefined,
        who: who === "other" ? `other: ${specify || ""}`.slice(0, 120) : who,
        people: people >= 1 && people <= 10 ? people : undefined,
        updates: !!form.updates?.checked,
        lang, status: "new",
      }, "APT");
      setDone(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e2) {
      console.error(e2);
      setErr(SEND_ERROR[lang] || SEND_ERROR.en);
      setBusy(false);
    }
  }

  return (
    <form className="card form long-form" onSubmit={send}>
      <Section n={1} title={s.s1}>
        <F label={s.name} req wide><input name="name" required autoComplete="name" maxLength={120} /></F>
        <F label={s.guardian}><input name="guardian" maxLength={120} /></F>
        <F label={s.gender}>
          <select name="gender" defaultValue=""><option value="" disabled>—</option>{Object.entries(g).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </F>
        <F label={s.dob}><input name="dob" type="date" max={today()} /></F>
        <F label={s.occupation}><input name="occupation" maxLength={120} /></F>
        <MobileField label={s.mobile} />
        <F label={s.email}><input name="email" type="email" autoComplete="email" maxLength={200} /></F>
        <F label={s.whatsapp}><input name="whatsapp" type="tel" maxLength={20} /></F>
      </Section>

      <Section n={2} title={s.s2}>
        <F label={s.door}><input name="door" maxLength={120} /></F>
        <F label={s.street}><input name="street" maxLength={140} /></F>
        <F label={s.town}><input name="town" maxLength={120} /></F>
        <DistrictSelect lang={lang} label={s.district} name="district" />
        <F label={s.pin} req><input name="pin" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="700001" /></F>
      </Section>

      <Section n={3} title={s.s3}>
        <F label={s.who} req>
          <select value={who} onChange={(e) => setWho(e.target.value)}>
            {Object.entries(s.whoOpts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </F>
        {who === "other" ? <F label={s.specify} req><input name="specify" required maxLength={100} /></F> : <span />}
        <F label={s.date} req><input name="date" type="date" required min={today()} /></F>
        <F label={s.time}><input name="time" type="time" min="10:00" max="18:00" /></F>
        <F label={s.altDate}><input name="altDate" type="date" min={today()} /></F>
        <F label={s.altTime}><input name="altTime" type="time" min="10:00" max="18:00" /></F>
        <F label={s.mode} wide>
          <div className="checks">
            {Object.entries(s.modes).map(([k, v], i) => <label key={k}><input type="radio" name="mode" value={k} defaultChecked={i === 0} /> {v}</label>)}
          </div>
        </F>
        <F label={s.people}><input name="people" type="number" min={1} max={10} defaultValue={1} /></F>
        <F label={s.duration}>
          <select name="duration" defaultValue="15">{["15", "30", "45", "60"].map((m) => <option key={m}>{m}</option>)}</select>
        </F>
      </Section>

      <Section n={4} title={s.s4}>
        <F label={s.reason} req wide>
          <select name="topic" required defaultValue=""><option value="" disabled>—</option>{Object.entries(s.reasons).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </F>
        <F label={s.describe} req wide><textarea name="reason" required rows={5} maxLength={3000} /></F>
        <F label={s.more} wide><textarea name="more" rows={3} maxLength={3000} /></F>
        {!LIVE && (
          <F label={s.docs} wide>
            <input type="file" multiple accept=".pdf,.doc,.docx,image/*" onChange={(e) => { if (e.target.files.length > 5) e.target.value = ""; }} />
          </F>
        )}
      </Section>

      <Section n={5} title={s.s5}>
        <label className="check wide"><input type="checkbox" required /> {s.correct}</label>
        <label className="check wide"><input type="checkbox" name="updates" /> {s.updates}</label>
      </Section>

      <div className="hp-field" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {err && <p className="form-note form-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
      <button className="btn btn-saffron" type="submit" disabled={busy}>{busy ? (SENDING[lang] || SENDING.en) : s.submit}</button>
      {!LIVE && <p className="form-note">{c.demoNote}</p>}
    </form>
  );
}

/* ---------------------------- Join as a member ---------------------------- */
const strong = (pw) => pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
const isAdult = (dob) => {
  if (!dob) return true;
  const d = new Date(dob), n = new Date();
  const age = n.getFullYear() - d.getFullYear() - (n < new Date(n.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  return age >= 18;
};

// Saved to the database as an application "waiting for payment" (Console →
// Members list, Admins only) + an email alert. No password is collected here —
// the member sets it when their membership is approved. No ID numbers, no files.
const JOIN_TEXT = {
  en: { pwLater: "You'll set your password when your membership is approved — we'll send you a link.", send: "Send registration", ref: "Reference" },
  bn: { pwLater: "সদস্যপদ অনুমোদিত হলে আপনি পাসওয়ার্ড তৈরি করবেন — আমরা আপনাকে একটি লিঙ্ক পাঠাব।", send: "নিবন্ধন পাঠান", ref: "রেফারেন্স" },
  hi: { pwLater: "सदस्यता स्वीकृत होने पर आप अपना पासवर्ड बनाएँगे — हम आपको एक लिंक भेजेंगे।", send: "पंजीकरण भेजें", ref: "संदर्भ" },
};

export function JoinForm({ lang, j, c }) {
  const [dob, setDob] = useState("");
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const jt = JOIN_TEXT[lang] || JOIN_TEXT.en;
  const adult = isAdult(dob);
  if (done) return <div className="card"><Done text={`${j.thanks} ${jt.ref}: ${done}`} c={c} /></div>;

  async function send(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!adult) return;
    if (!LIVE && !strong(pw)) return;
    if (form.website?.value) { setDone("JOIN-000000"); return; } // spam trap
    setBusy(true); setErr("");
    try {
      const f = fieldsOf(form, ["district", "assembly", "block", "ward", "name", "gender", "guardian", "dob",
        "occupation", "workplace", "group", "address", "pin", "mobile", "mobile2", "whatsapp", "email"]);
      const { ref: r } = await submitForm("applications", {
        ...f, lang, declarations: true, status: "pending_payment", fee: 5,
      }, "JOIN");
      setDone(r);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e2) {
      console.error(e2);
      setErr(SEND_ERROR[lang] || SEND_ERROR.en);
      setBusy(false);
    }
  }

  return (
    <form className="card form long-form" onSubmit={send}>
      <h2 style={{ fontSize: 24, margin: 0 }}>{j.title}</h2>

      <Section n={1} title={j.s1}>
        <DistrictSelect lang={lang} label={`${j.district} *`} name="district" />
        <F label={j.ac}><input name="assembly" maxLength={120} /></F>
        <F label={j.block}><input name="block" maxLength={120} /></F>
        <F label={j.ward}><input name="ward" maxLength={120} /></F>
      </Section>

      <Section n={2} title={j.s2}>
        <F label={j.name} req wide><input name="name" required autoComplete="name" maxLength={120} /></F>
        <F label={j.gender} req wide>
          <div className="checks">
            {Object.entries(j.genders).map(([k, v]) => <label key={k}><input type="radio" name="gender" value={k} required /> {v}</label>)}
          </div>
        </F>
        <F label={j.guardian} req><input name="guardian" required maxLength={120} /></F>
        <F label={j.dob}>
          <input name="dob" type="date" max={today()} value={dob} onChange={(e) => setDob(e.target.value)} />
          {!adult && <small className="err">{j.under18}</small>}
        </F>
        <F label={j.occupation} req><input name="occupation" required maxLength={120} /></F>
        <F label={j.workplace}><input name="workplace" maxLength={160} /></F>
        <F label={j.org} wide>
          <select name="group" defaultValue="">
            <option value="">{j.none}</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{t(g.name, lang)}</option>)}
          </select>
        </F>
        <F label={j.address} wide><textarea name="address" rows={2} autoComplete="street-address" maxLength={400} /></F>
        <F label={j.pin}><input name="pin" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} /></F>
      </Section>

      <Section n={3} title={j.s3}>
        <MobileField label={j.mobile} name="mobile" />
        <F label={j.mobile2}><input name="mobile2" type="tel" maxLength={15} /></F>
        <F label={j.whatsapp}><input name="whatsapp" type="tel" maxLength={15} /></F>
        <F label={j.email}><input name="email" type="email" autoComplete="email" maxLength={200} /></F>
        {LIVE ? (
          <p className="form-note wide"><Icon name="lock" size={15} /> {jt.pwLater}</p>
        ) : (
          <>
            <F label={j.password} req wide>
              <PasswordInput required value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" />
              <small className={pw && !strong(pw) ? "err" : "hint"}>{pw && !strong(pw) ? j.pwWeak : j.pwRule}</small>
            </F>
            <F label={j.photo} wide><input type="file" accept="image/*" /></F>
          </>
        )}
      </Section>

      <Section n={4} title={j.s4}>
        <label className="check wide"><input type="checkbox" required /> {j.age18}</label>
        <label className="check wide"><input type="checkbox" required /> {j.declare}</label>
      </Section>

      {/* Membership fee — ₹5. Razorpay checkout comes later; for now no payment is taken. */}
      <div className="fee-box">
        <div><b>{j.fee}</b><small>{j.feeNote}</small></div>
        <span className="fee-amount">{j.feeAmount}</span>
      </div>

      <div className="hp-field" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {err && <p className="form-note form-err" role="alert"><Icon name="alert" size={16} /> {err}</p>}
      <button className="btn btn-saffron" type="submit" disabled={busy || !adult}>{busy ? (SENDING[lang] || SENDING.en) : LIVE ? jt.send : j.submit}</button>
      {!LIVE && <p className="form-note">{c.demoNote}</p>}
    </form>
  );
}

/* ---------------------------- Donate ---------------------------- */
// Razorpay is added later (backend). For now the form shows the flow and takes no money.
const AMOUNTS = [100, 500, 1000, 2000];
export function DonateForm({ lang, s, c }) {
  const [amt, setAmt] = useState(500);
  const [custom, setCustom] = useState("");
  const [done, setDone] = useState(null);
  const value = custom ? Number(custom) : amt;
  const money = (n) => `₹${new Intl.NumberFormat(lang === "bn" ? "bn-IN" : "en-IN").format(n || 0)}`;
  if (done) return <div className="card"><Done text={fill(s.thanks, { id: done })} c={c} /></div>;
  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); if (!value || value < 10) return; setDone(ref("DON")); }}>
      <F label={s.amount} req>
        <div className="amounts">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" className={`amount${!custom && amt === a ? " on" : ""}`} onClick={() => { setAmt(a); setCustom(""); }}>{money(a)}</button>
          ))}
          <input className="amount-other" type="number" min={10} placeholder={s.other} value={custom} onChange={(e) => setCustom(e.target.value)} aria-label={s.other} />
        </div>
      </F>
      <F label={s.name} req><input required autoComplete="name" /></F>
      <F label={s.mobile} req><input type="tel" required autoComplete="tel" /></F>
      <F label={s.email} req><input type="email" required autoComplete="email" /></F>
      <F label={s.pan}><input maxLength={10} pattern="[A-Za-z]{5}[0-9]{4}[A-Za-z]" placeholder="ABCDE1234F" style={{ textTransform: "uppercase" }} /></F>
      <F label={s.address}><textarea rows={2} autoComplete="street-address" /></F>
      <DistrictSelect lang={lang} label={s.district} name="don-district" />
      <label className="check"><input type="checkbox" required /> {s.citizen}</label>
      <button className="btn btn-saffron" type="submit">{fill(s.submit, { amt: money(value) })}</button>
      <p className="form-note">{s.note}</p>
    </form>
  );
}